<?php

namespace App\Console\Commands;

use App\Models\PortfolioEntry;
use App\Models\PortfolioProfile;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

#[Signature('portfolio:import-cv {--force : Écraser et synchroniser les données complètes du CV et des études de cas}')]
#[Description('Importer et enrichir les informations réelles du CV de Karim et ses études de cas détaillées')]
class ImportPortfolioCv extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $force = (bool) $this->option('force');

        $profileData = [
            'full_name' => 'Kiswendsida Abdoul Karim OUEDRAOGO',
            'display_name' => 'Karim',
            'job_title' => 'Développeur Full-Stack · Technicien IT',
            'tagline' => 'Du génie logiciel aux architectures web fiables et pérennes.',
            'bio' => 'Titulaire d’une licence en génie logiciel, avec une expérience éprouvée en développement d’applications web (Laravel, React, API REST) et en support des infrastructures IT. Rigoureux et orienté solutions, je conçois des systèmes performants, modulaires et adaptés aux exigences métiers.',
            'email' => 'kouvik440@gmail.com',
            'phone' => '+226 07 75 25 20',
            'location' => 'Ouagadougou, Burkina Faso',
            'github_url' => 'https://github.com/kouvik440',
            'linkedin_url' => 'https://linkedin.com/in/karim-ouedraogo',
            'availability' => 'Disponible pour opportunités & missions',
            'meta_title' => 'Kiswendsida Abdoul Karim OUEDRAOGO — Développeur Full-Stack & Génie Logiciel',
            'meta_description' => 'Portfolio professionnel de Kiswendsida Abdoul Karim OUEDRAOGO : Développeur Full-Stack (Laravel, React, MySQL) et Technicien IT. Découvrez ses réalisations, compétences et études de cas détaillées.',
            'default_theme' => 'dark',
            'content' => [
                'hero_cta' => 'Me contacter / Échanger',
                'hero_footer' => 'Concevoir · Développer · Déployer · Accompagner',
                'work_heading' => 'Réalisations & Études de cas.',
                'work_intro' => 'Des problématiques métiers réelles résolues par des solutions logicielles sur-mesure, robustes et bien documentées.',
                'about_heading' => 'Le code. Et le terrain.',
                'about_caption' => 'Génie logiciel & Support informatique',
                'skills_heading' => 'Stack technique & Savoir-faire.',
                'skills_intro' => 'Des compétences transversales allant de la modélisation de bases de données aux interfaces interactives et au diagnostic système.',
                'career_heading' => 'Parcours académique & professionnel.',
                'contact_heading' => 'Donnons vie à votre projet.',
                'contact_intro' => 'Une opportunité d’emploi, une mission de développement web ou un besoin en support IT ? Échangeons dès aujourd’hui.',
                'empty_projects' => 'Les réalisations seront présentées prochainement.',
            ],
        ];

        $profile = PortfolioProfile::firstOrNew(['id' => 1]);
        foreach ($profileData as $key => $value) {
            if ($force || ! $profile->getAttribute($key)) {
                $profile->setAttribute($key, $value);
            }
        }

        // Attach CV and photo if present
        $cvs = glob(base_path('CV*.pdf'));
        if (count($cvs) >= 1 && (! $profile->cv_path || ! Storage::disk('local')->exists($profile->cv_path))) {
            Storage::disk('local')->put('portfolio/cv-karim.pdf', file_get_contents($cvs[0]));
            $profile->cv_path = 'portfolio/cv-karim.pdf';
        }
        $photoSources = [
            base_path('.taste-skill/cv-profile.png'),
            base_path('cv-profile.png'),
            storage_path('app/private/portfolio/profile-karim.png'),
        ];
        foreach ($photoSources as $photo) {
            if (is_file($photo)) {
                if (! Storage::disk('local')->exists('portfolio/profile-karim.png')) {
                    Storage::disk('local')->put('portfolio/profile-karim.png', file_get_contents($photo));
                }
                $profile->photo_path = 'portfolio/profile-karim.png';
                break;
            }
        }
        $profile->save();

        // 1. Formations
        $educations = [
            [
                'import_key' => 'cv-licence',
                'type' => 'education',
                'title' => 'Licence en génie logiciel',
                'organization' => 'Université Aube Nouvelle',
                'period' => '2026',
                'description' => 'Conception et modélisation logicielle, architectures orientées objet et web, bases de données relationnelles, algorithmique avancée et gestion de projets informatiques.',
                'sort_order' => 0,
            ],
            [
                'import_key' => 'cv-bac',
                'type' => 'education',
                'title' => 'Baccalauréat série H, spécialité informatique',
                'organization' => 'LTN, Ouagadougou',
                'period' => '2023',
                'description' => 'Formation technique en informatique industrielle et de gestion, algorithmique, programmation procédurale, circuits logiques et maintenance.',
                'sort_order' => 1,
            ],
            [
                'import_key' => 'cv-bep',
                'type' => 'education',
                'title' => 'Brevet d’études professionnelles en informatique (BEP)',
                'organization' => 'LTN, Ouagadougou',
                'period' => '2023',
                'description' => 'Fondamentaux des systèmes d’exploitation (Windows, Linux), réseaux informatiques de base et maintenance préventive du matériel.',
                'sort_order' => 2,
            ],
        ];

        // 2. Expériences
        $experiences = [
            [
                'import_key' => 'cv-cbc',
                'type' => 'experience',
                'title' => 'Assistant développeur web et support IT',
                'organization' => 'Conseil Burkinabè des Chargeurs (CBC), Ouagadougou',
                'period' => '2025–2026 · 6 mois',
                'description' => 'Développement et maintenance corrective d’applications web internes. Gestion et suivi des flux informatiques des opérations de fret. Support technique de proximité, diagnostic réseau et assistance aux utilisateurs.',
                'sort_order' => 0,
            ],
            [
                'import_key' => 'cv-abnorm',
                'type' => 'experience',
                'title' => 'Assistant informatique',
                'organization' => 'Agence Burkinabè de Normalisation, de la Métrologie et de la Qualité (ABNORM), Ouagadougou',
                'period' => '2024 · 2 mois',
                'description' => 'Maintenance et support du parc informatique, configuration et déploiement de postes sous Windows et Linux, installation de logiciels métiers, brassage et câblage réseau.',
                'sort_order' => 1,
            ],
        ];

        // 3. Compétences par pôles d'expertise
        $skills = [
            [
                'import_key' => 'cv-dev',
                'type' => 'skill',
                'title' => 'Développement Full-Stack & Logiciel',
                'description' => 'PHP 8, JavaScript, Java, C/C++ · Laravel, React 19, Django, .NET, Bootstrap · Conception d’API REST sécurisées',
                'sort_order' => 0,
            ],
            [
                'import_key' => 'cv-data',
                'type' => 'skill',
                'title' => 'Bases de données & Outils d’ingénierie',
                'description' => 'MySQL, PostgreSQL, NoSQL · Modélisation relationnelle, optimisation des index et requêtes · Git, GitHub, Vite',
                'sort_order' => 1,
            ],
            [
                'import_key' => 'cv-sys',
                'type' => 'skill',
                'title' => 'Systèmes, Réseaux & Support IT',
                'description' => 'Windows, Windows Server, Linux · Cisco Packet Tracer, routage, sous-réseaux · Dépannage matériel et maintenance',
                'sort_order' => 2,
            ],
            [
                'import_key' => 'cv-office',
                'type' => 'skill',
                'title' => 'Qualité Logicielle & Bureautique',
                'description' => 'Architecture modulaire, validation de formulaires, sécurité CSRF/XSS · Suite bureautique Microsoft Office avancée',
                'sort_order' => 3,
            ],
        ];

        // 4. Langues & Intérêts
        $others = [
            [
                'import_key' => 'cv-fr',
                'type' => 'language',
                'title' => 'Français',
                'description' => 'Excellent niveau (langue de travail et de rédaction technique)',
                'sort_order' => 0,
            ],
            [
                'import_key' => 'cv-en',
                'type' => 'language',
                'title' => 'Anglais',
                'description' => 'Bon niveau (documentation technique, échanges professionnels)',
                'sort_order' => 1,
            ],
            [
                'import_key' => 'cv-football',
                'type' => 'interest',
                'title' => 'Football',
                'description' => 'Esprit d’équipe, communication et discipline sportive',
                'sort_order' => 0,
            ],
            [
                'import_key' => 'cv-velo',
                'type' => 'interest',
                'title' => 'Cyclisme',
                'description' => 'Endurance, persévérance et gestion de l’effort',
                'sort_order' => 1,
            ],
            [
                'import_key' => 'cv-natation',
                'type' => 'interest',
                'title' => 'Natation',
                'description' => 'Rigueur, calme et concentration',
                'sort_order' => 2,
            ],
        ];

        foreach ([...$educations, ...$experiences, ...$skills, ...$others] as $item) {
            $entry = PortfolioEntry::firstOrNew(['import_key' => $item['import_key']]);
            foreach ($item as $k => $v) {
                if ($force || ! $entry->getAttribute($k)) {
                    $entry->setAttribute($k, $v);
                }
            }
            $entry->is_published = true;
            $entry->save();
        }

        // 5. Projets & Études de cas approfondies
        $repairsCover = Storage::disk('local')->exists('portfolio/projects/initial-15-reparations-preview.png')
            ? 'portfolio/projects/initial-15-reparations-preview.png'
            : (is_file(public_path('images/projects/reparations-preview.png')) ? 'portfolio/projects/initial-15-reparations-preview.png' : null);

        $portfolioCover = Storage::disk('local')->exists('portfolio/projects/initial-16-portfolio-preview.jpg')
            ? 'portfolio/projects/initial-16-portfolio-preview.jpg'
            : (is_file(public_path('images/projects/portfolio-preview.jpg')) ? 'portfolio/projects/initial-16-portfolio-preview.jpg' : null);

        $projects = [
            [
                'import_key' => 'project-repairs',
                'type' => 'project',
                'title' => 'Réparations Phones & Gestion Atelier',
                'category' => 'Application Web Full-Stack',
                'slug' => 'reparations-phones',
                'description' => 'Plateforme complète de gestion d’atelier de maintenance : fiches d’intervention, suivi des réparations en direct, stock de pièces détachées et facturation.',
                'technologies' => ['Laravel', 'React', 'MySQL', 'Tailwind CSS', 'API REST'],
                'url' => 'https://github.com/kouvik440/reparations-phones',
                'is_featured' => true,
                'is_published' => true,
                'sort_order' => 0,
                'cover_path' => $repairsCover,
                'cover_alt' => 'Interface de l’application Réparations Phones',
                'problem' => "Dans les ateliers de réparation de téléphones et matériel informatique, le suivi sur papier ou tableurs isolés provoquait des pertes de pièces, des retards de restitution et des contestations sur l'état initial des équipements confiés.",
                'solution' => "Conception d'une application web centralisée permettant l'enregistrement d'une intervention avec inspection initiale (numéro IMEI, photos, panne déclarée), le suivi d'avancement par statuts clairs (diagnostiqué, attente pièce, réparé, livré) et l'édition automatique de devis et reçus sécurisés.",
                'contribution' => "Conception de l'architecture logicielle sous Laravel (modèles Eloquent, policies, API REST), développement des composants interactifs en React pour la saisie comptoir, gestion des autorisations et journalisation de chaque action technique.",
                'result' => "Zéro perte d'historique sur les appareils traités, division par deux du temps de diagnostic au guichet et amélioration immédiate de la confiance client grâce aux reçus détaillés.",
            ],
            [
                'import_key' => 'project-logistics',
                'type' => 'project',
                'title' => 'Suivi Fret & Logistique Transit',
                'category' => 'Système d’Information & Données',
                'slug' => 'suivi-fret-logistique',
                'description' => 'Outil de centralisation et de contrôle des déclarations de fret terrestre et maritime, avec tableaux de bord analytiques et validation de conformité.',
                'technologies' => ['Laravel', 'PHP', 'PostgreSQL', 'JavaScript', 'Bootstrap'],
                'url' => 'https://github.com/kouvik440',
                'is_featured' => false,
                'is_published' => true,
                'sort_order' => 1,
                'cover_path' => $portfolioCover,
                'cover_alt' => 'Tableau de bord de suivi du fret logistique',
                'problem' => "Le traitement manuel des bordereaux de chargement et des manifestes de fret dans les corridors d'import-export entraînait des lenteurs administratives, des risques d'erreurs de saisie et un manque de visibilité globale sur les flux de marchandises.",
                'solution' => "Déploiement d'un portail web interne permettant la saisie contrôlée des bordereaux, la vérification automatique des données de cargaison et la génération d'états statistiques décisionnels pour les équipes de supervision.",
                'contribution' => "Développement des modules de validation de données côté serveur, automatisation des alertes de non-conformité, conception de requêtes SQL optimisées pour les agrégations de gros volumes et assistance aux utilisateurs finaux.",
                'result' => "Accélération du délai de traitement des dossiers de cargaison, fiabilisation des statistiques de transport et sécurisation des enregistrements.",
            ],
            [
                'import_key' => 'project-portfolio',
                'type' => 'project',
                'title' => 'Portfolio & Studio d’Administration',
                'category' => 'Architecture Logicielle',
                'slug' => 'portfolio-karim',
                'description' => 'Portfolio d’ingénieur logiciel haute performance avec grille Bento, direction artistique Aurora Graphite et back-office d’administration sur-mesure.',
                'technologies' => ['Laravel 12', 'React 19', 'Tailwind CSS 4', 'MySQL', 'Vite'],
                'url' => 'https://github.com/kouvik440/portfolio_karim',
                'is_featured' => false,
                'is_published' => true,
                'sort_order' => 2,
                'cover_path' => $portfolioCover,
                'cover_alt' => 'Aperçu du portfolio développeur full-stack',
                'problem' => "Disposer d'une vitrine professionnelle sur-mesure qui ne ressemble pas à un template générique, garantissant une accessibilité irréprochable (WCAG AA), une vitesse optimale et une gestion 100% autonome de tous les contenus sans modifier le code React.",
                'solution' => "Conception d'une application hybride où Laravel alimente directement les composants React, avec un studio d'administration complet protégé par authentification et policies, respect du mode réduit (reduced-motion) et SEO natif.",
                'contribution' => "Architecture complète du projet, intégration du design system modulaire Bento, sécurisation des formulaires contre le spam et le CSRF, implémentation des téléchargements sécurisés (CV et médias) et automatisation des tests.",
                'result' => "Score de performance optimal, temps de chargement inférieur à 1 seconde, consultation fluide au clavier et sur mobile, et administration autonome en temps réel.",
            ],
        ];

        foreach ($projects as $proj) {
            $entry = PortfolioEntry::firstOrNew(['import_key' => $proj['import_key']]);
            foreach ($proj as $k => $v) {
                if ($force || ! $entry->getAttribute($k)) {
                    $entry->setAttribute($k, $v);
                }
            }
            $entry->save();
        }

        $this->info('Données réelles du CV, compétences structurées et études de cas importées avec succès !');

        return self::SUCCESS;
    }
}
