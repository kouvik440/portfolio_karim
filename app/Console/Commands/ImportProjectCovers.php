<?php

namespace App\Console\Commands;

use App\Models\PortfolioEntry;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

#[Signature('portfolio:import-covers')]
#[Description('Rattacher les captures initiales aux projets sans remplacer les médias existants')]
class ImportProjectCovers extends Command
{
    public function handle(): int
    {
        foreach (['project-repairs' => 'reparations-preview.png', 'project-portfolio' => 'portfolio-preview.jpg'] as $key => $file) {
            $entry = PortfolioEntry::where('import_key', $key)->where('type', 'project')->first();
            $source = public_path('images/projects/'.$file);
            if (! $entry || $entry->cover_path || ! is_file($source)) {
                continue;
            }
            $path = 'portfolio/projects/initial-'.$entry->id.'-'.basename($file);
            Storage::disk('local')->put($path, file_get_contents($source));
            $entry->update(['cover_path' => $path, 'cover_alt' => 'Capture réelle de l’interface '.$entry->title, 'is_featured' => $key === 'project-repairs']);
        }
        $this->info('Captures initiales rattachées. Vous pouvez maintenant les remplacer dans l’administration.');

        return self::SUCCESS;
    }
}
