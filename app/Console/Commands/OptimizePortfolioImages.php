<?php

namespace App\Console\Commands;

use App\Services\ImageOptimizer;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class OptimizePortfolioImages extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'portfolio:optimize-images';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Compresse et redimensionne les images existantes du portfolio pour un chargement ultra-rapide';

    /**
     * Execute the console command.
     */
    public function handle(ImageOptimizer $optimizer): int
    {
        $this->info('Analyse et optimisation des images du portfolio...');

        $files = Storage::disk('local')->allFiles('portfolio');
        $optimizedCount = 0;
        $savedBytes = 0;

        foreach ($files as $file) {
            $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            if (! in_array($extension, ['jpg', 'jpeg', 'png', 'webp'], true)) {
                continue;
            }

            $beforeSize = Storage::disk('local')->size($file);
            $maxWidth = str_contains($file, 'projects') ? 1600 : 1000;
            $maxHeight = str_contains($file, 'projects') ? 1600 : 1000;

            if ($optimizer->optimizeFileInPlace($file, $maxWidth, $maxHeight, 82)) {
                $afterSize = Storage::disk('local')->size($file);
                $saved = $beforeSize - $afterSize;
                if ($saved > 0) {
                    $savedBytes += $saved;
                    $optimizedCount++;
                    $this->line(sprintf(
                        '  ✓ %s : %s Ko -> %s Ko (Gain : %s Ko / -%.1f%%)',
                        $file,
                        round($beforeSize / 1024),
                        round($afterSize / 1024),
                        round($saved / 1024),
                        ($saved / $beforeSize) * 100
                    ));
                }
            }
        }

        $this->info(sprintf(
            'Optimisation terminée ! %d image(s) allégée(s). Espace économisé : %.2f Mo.',
            $optimizedCount,
            $savedBytes / 1024 / 1024
        ));

        return Command::SUCCESS;
    }
}
