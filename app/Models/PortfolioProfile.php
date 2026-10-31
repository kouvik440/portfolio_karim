<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PortfolioProfile extends Model
{
    protected $guarded = ['id'];

    public const CONTENT_DEFAULTS = [
        'hero_cta' => 'Parlons de votre projet',
        'hero_footer' => 'Concevoir. Développer. Accompagner.',
        'work_heading' => 'Projets choisis.',
        'work_intro' => 'Des besoins réels, des solutions web. Explorez le travail derrière chaque projet.',
        'about_heading' => 'Le web. Et le terrain.',
        'about_caption' => 'Développement & informatique',
        'skills_heading' => 'Les outils du métier.',
        'skills_intro' => 'Des compétences qui relient l’application à son environnement.',
        'career_heading' => 'Mon parcours.',
        'contact_heading' => 'On en parle ?',
        'contact_intro' => 'Un projet à construire, un besoin informatique ou une collaboration. La conversation commence ici.',
        'empty_projects' => 'Les réalisations seront présentées prochainement.',
    ];

    protected function casts(): array
    {
        return ['content' => 'array'];
    }
}
