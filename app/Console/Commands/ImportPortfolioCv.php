<?php

namespace App\Console\Commands;

use App\Models\PortfolioEntry;
use App\Models\PortfolioProfile;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

#[Signature('portfolio:import-cv')]
#[Description('Importer une première fois les informations du CV de Karim sans écraser les modifications')]
class ImportPortfolioCv extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $profile = PortfolioProfile::firstOrCreate(['id' => 1], [
            'full_name' => 'Kiswendsida Abdoul Karim OUEDRAOGO',
            'display_name' => 'Karim',
            'job_title' => 'Développeur full stack · Technicien IT',
            'tagline' => 'Du développement web aux solutions informatiques.',
            'bio' => 'Titulaire d’une licence en génie logiciel, avec une expérience en développement web, réseaux informatiques et support IT. Rigoureux et autonome, je souhaite mettre mes compétences au service de projets informatiques et contribuer à la qualité des solutions proposées.',
            'email' => 'kouvik440@gmail.com', 'phone' => '07-75-25-20', 'location' => 'Ouagadougou',
            'github_url' => 'https://github.com/kouvik440',
        ]);
        $cvs = glob(base_path('CV*.pdf'));
        if (! $profile->cv_path && count($cvs) === 1) {
            Storage::disk('local')->put('portfolio/cv-karim.pdf', file_get_contents($cvs[0]));
            $profile->cv_path = 'portfolio/cv-karim.pdf';
        }
        $photo = base_path('.taste-skill/cv-profile.png');
        if (! $profile->photo_path && is_file($photo)) {
            Storage::disk('local')->put('portfolio/profile-karim.png', file_get_contents($photo));
            $profile->photo_path = 'portfolio/profile-karim.png';
        }
        $profile->save();
        $entries = [
            ['education', 'licence', 'Licence en génie logiciel', 'Université Aube Nouvelle', '2026', null, null],
            ['education', 'bac', 'Baccalauréat série H, spécialité informatique', 'LTN, Ouagadougou', '2023', null, null],
            ['education', 'bep', 'Brevet d’études professionnelles en informatique', 'LTN, Ouagadougou', '2023', null, null],
            ['experience', 'cbc', 'Assistant développeur web et support IT', 'Conseil Burkinabè des Chargeurs (CBC), Ouagadougou', '2025–2026 · 6 mois', null, null],
            ['experience', 'abnorm', 'Assistant informatique', 'ABNORM, Ouagadougou', '2024 · 2 mois', null, null],
            ['skill', 'dev', 'Développement', null, null, null, 'PHP, JavaScript, Java, C/C++ · Django, Laravel, Microsoft .NET, Bootstrap · Développement d’API REST'],
            ['skill', 'data', 'Données et outils', null, null, null, 'PostgreSQL, MySQL, NoSQL, Git, GitHub'],
            ['skill', 'sys', 'Systèmes, réseaux et support', null, null, null, 'Windows, Windows Server, Linux · Cisco Packet Tracer, dépannage informatique'],
            ['skill', 'office', 'Bureautique', null, null, null, 'Microsoft Office'],
            ['interest', 'football', 'Football', null, null, null, null],
            ['interest', 'velo', 'Vélo', null, null, null, null],
            ['interest', 'natation', 'Natation', null, null, null, null],
            ['language', 'fr', 'Français', null, null, null, 'Excellent niveau'],
            ['language', 'en', 'Anglais', null, null, null, 'Bon niveau'],
        ];
        foreach ($entries as $order => [$type, $key, $title, $organization, $period, $category, $description]) {
            PortfolioEntry::firstOrCreate(['import_key' => 'cv-'.$key], compact('type', 'title', 'organization', 'period', 'category', 'description') + ['sort_order' => $order, 'is_published' => true]);
        }
        PortfolioEntry::firstOrCreate(['import_key' => 'project-repairs'], [
            'type' => 'project', 'title' => 'Réparations Phones', 'category' => 'Application web',
            'description' => 'Gestion des clients, des appareils et du suivi des réparations dans une même application.',
            'technologies' => ['Laravel', 'React', 'MySQL'], 'url' => 'https://github.com/kouvik440/reparations-phones', 'sort_order' => 0,
        ]);
        PortfolioEntry::firstOrCreate(['import_key' => 'project-portfolio'], [
            'type' => 'project', 'title' => 'Portfolio Karim', 'category' => 'Site web',
            'description' => 'Un portfolio personnel avec des composants React, une administration Laravel et des contenus stockés dans MySQL.',
            'technologies' => ['Laravel', 'React', 'Tailwind CSS'], 'sort_order' => 1,
        ]);
        $this->info('CV et contenu initial importés. Les modifications existantes ont été conservées.');

        return self::SUCCESS;
    }
}
