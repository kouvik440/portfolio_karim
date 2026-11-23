<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageOptimizer
{
    /**
     * Store and optimize an uploaded image file.
     */
    public function storeOptimized(
        UploadedFile $file,
        string $directory = 'portfolio',
        int $maxWidth = 1600,
        int $maxHeight = 1600,
        int $quality = 82
    ): string {
        $mime = $file->getMimeType();

        // If not an image or GD is not loaded, store normally.
        if (! str_starts_with((string) $mime, 'image/') || ! extension_loaded('gd')) {
            return $file->store($directory, 'local');
        }

        $sourcePath = $file->getRealPath();
        $optimizedData = $this->compressImage($sourcePath, $maxWidth, $maxHeight, $quality);

        if ($optimizedData === null) {
            return $file->store($directory, 'local');
        }

        $extension = $file->getClientOriginalExtension() ?: 'jpg';
        $fileName = Str::random(40).'.'.$extension;
        $targetPath = trim($directory, '/').'/'.$fileName;

        Storage::disk('local')->put($targetPath, $optimizedData);

        return $targetPath;
    }

    /**
     * Optimize an existing image file on disk in-place.
     */
    public function optimizeFileInPlace(
        string $relativePath,
        int $maxWidth = 1600,
        int $maxHeight = 1600,
        int $quality = 82
    ): bool {
        if (! extension_loaded('gd') || ! Storage::disk('local')->exists($relativePath)) {
            return false;
        }

        $absolutePath = Storage::disk('local')->path($relativePath);
        $optimizedData = $this->compressImage($absolutePath, $maxWidth, $maxHeight, $quality);

        if ($optimizedData !== null && strlen($optimizedData) < filesize($absolutePath)) {
            Storage::disk('local')->put($relativePath, $optimizedData);

            return true;
        }

        return false;
    }

    /**
     * Compress and downscale an image from file path into binary string.
     */
    private function compressImage(
        string $sourcePath,
        int $maxWidth,
        int $maxHeight,
        int $quality
    ): ?string {
        $imageInfo = @getimagesize($sourcePath);
        if ($imageInfo === false) {
            return null;
        }

        [$width, $height, $type] = $imageInfo;

        $source = match ($type) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($sourcePath),
            IMAGETYPE_PNG => @imagecreatefrompng($sourcePath),
            IMAGETYPE_WEBP => @imagecreatefromwebp($sourcePath),
            default => null,
        };

        if ($source === false || $source === null) {
            return null;
        }

        // Calculate aspect-ratio preserved dimensions
        $ratio = min($maxWidth / max(1, $width), $maxHeight / max(1, $height), 1.0);
        $newWidth = (int) round($width * $ratio);
        $newHeight = (int) round($height * $ratio);

        $target = imagecreatetruecolor($newWidth, $newHeight);
        if ($target === false) {
            imagedestroy($source);

            return null;
        }

        // Preserve alpha transparency for PNG & WebP
        if ($type === IMAGETYPE_PNG || $type === IMAGETYPE_WEBP) {
            imagealphablending($target, false);
            imagesavealpha($target, true);
            $transparent = imagecolorallocatealpha($target, 255, 255, 255, 127);
            imagefilledrectangle($target, 0, 0, $newWidth, $newHeight, $transparent);
        }

        imagecopyresampled($target, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
        imagedestroy($source);

        ob_start();
        match ($type) {
            IMAGETYPE_JPEG => imagejpeg($target, null, $quality),
            IMAGETYPE_PNG => imagepng($target, null, 7),
            IMAGETYPE_WEBP => imagewebp($target, null, $quality),
            default => null,
        };
        $output = ob_get_clean();
        imagedestroy($target);

        return $output !== false ? $output : null;
    }
}
