import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import Arrow from './Components/Arrow';
import ContactForm from './Components/ContactForm';

const portfolio = JSON.parse(document.getElementById('portfolio-data')?.textContent || '{}');
const profile = portfolio.profile || {};
const entries = portfolio.entries || {};
const displayName = profile.display_name || 'Karim';
const lastName = (profile.full_name || '').trim().split(/\s+/).at(-1) || '';
const familyName = lastName.toLocaleLowerCase('fr') === displayName.toLocaleLowerCase('fr') ? '' : lastName.charAt(0).toLocaleUpperCase('fr') + lastName.slice(1).toLocaleLowerCase('fr');
const projects = (entries.project || []).map(project => ({ ...project, stack: project.technologies || [] }));
const navigation = [['projets', 'Projets'], ['apropos', 'À propos'], ['parcours', 'Parcours'], ['contact', 'Contact']];

function projectImage(project) {
    if (project.url?.includes('reparations-phones') || /réparations phones/i.test(project.title)) return '/images/projects/reparations-preview.png';
    if (/portfolio karim/i.test(project.title)) return '/images/projects/portfolio-preview.jpg';
    return null;
}

function ProjectShowcase({ project }) {
    if (!project) return <div className="project-empty"><p>De nouveaux projets seront présentés ici.</p></div>;
    const image = projectImage(project);
    return <article className="project-stage" key={project.id}>
        <div className={`project-screen ${image ? '' : 'project-screen-type'}`}>
            {image ? <img src={image} alt={`Aperçu réel du projet ${project.title}`} width="1440" height="960" loading="lazy" /> : <span>{project.title}</span>}
        </div>
        <div className="project-caption"><h3>{project.title}</h3><span>{project.category || 'Projet web'}</span></div>
        <p className="project-description">{project.description}</p>
        <div className="project-bottom"><ul className="stack" aria-label="Technologies">{project.stack.map(item => <li key={item}>{item}</li>)}</ul>{project.url && <a className="text-link" href={project.url} target="_blank" rel="noopener noreferrer">{project.url.includes('github.com') ? 'Voir le code' : 'Visiter le projet'}<Arrow diagonal /></a>}</div>
    </article>;
}

export default function PortfolioApp() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [filter, setFilter] = useState('Tous');
    const [selectedId, setSelectedId] = useState(projects[0]?.id);
    const [active, setActive] = useState('accueil');
    const [career, setCareer] = useState(entries.experience?.length ? 'experience' : 'education');
    const menuButton = useRef(null);
    const transition = useRef(null);
    const filters = ['Tous', ...new Set(projects.map(project => project.category).filter(Boolean))];
    const visibleProjects = projects.filter(project => filter === 'Tous' || project.category === filter);
    const selectedProject = visibleProjects.find(project => project.id === selectedId) || visibleProjects[0];

    function changeProject(update) {
        if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { update(); return; }
        transition.current?.skipTransition();
        const current = document.startViewTransition(() => flushSync(update));
        transition.current = current;
        current.ready.catch(() => {});
        current.finished.catch(() => {}).finally(() => { if (transition.current === current) transition.current = null; });
    }

    useEffect(() => {
        if (!('IntersectionObserver' in window)) return;
        const observer = new IntersectionObserver(items => {
            items.forEach(item => { if (item.isIntersecting) { item.target.classList.add('is-visible'); observer.unobserve(item.target); } });
        }, { threshold: 0.12 });
        document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
        const sections = new IntersectionObserver(items => { items.forEach(item => { if (item.isIntersecting) setActive(item.target.id); }); }, { rootMargin: '-10% 0px -60% 0px' });
        document.querySelectorAll('section[id]').forEach(section => sections.observe(section));
        return () => { observer.disconnect(); sections.disconnect(); };
    }, [filter, career]);

    useEffect(() => {
        const escape = event => { if (event.key === 'Escape' && menuOpen) { setMenuOpen(false); menuButton.current?.focus(); } };
        const desktop = window.matchMedia('(min-width: 761px)');
        const close = () => { if (desktop.matches) setMenuOpen(false); };
        document.addEventListener('keydown', escape);
        desktop.addEventListener('change', close);
        return () => { document.removeEventListener('keydown', escape); desktop.removeEventListener('change', close); };
    }, [menuOpen]);

    useEffect(() => () => transition.current?.skipTransition(), []);

    return <div className="portfolio-site">
        <a href="#contenu" className="skip-link">Aller au contenu</a>
        <header className="site-header">
            <a className="wordmark" href="#accueil" aria-label={`${displayName}, accueil`}>{displayName.charAt(0)}<span aria-hidden="true">/</span>{familyName.charAt(0) || 'O'}</a>
            <button ref={menuButton} className="menu-button" type="button" aria-expanded={menuOpen} aria-controls="navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Fermer' : 'Menu'}<span aria-hidden="true">{menuOpen ? '−' : '+'}</span></button>
            <nav id="navigation" className={menuOpen ? 'is-open' : ''} aria-label="Navigation principale">{navigation.map(([id, label]) => <a href={`#${id}`} key={id} aria-current={active === id ? 'location' : undefined} onClick={() => setMenuOpen(false)}>{label}</a>)}</nav>
            {profile.cv_url && <a className="header-cv text-link" href={profile.cv_url}>Mon CV<Arrow diagonal /></a>}
        </header>

        <main id="contenu">
            <section className="hero page-gutter" id="accueil" aria-labelledby="hero-title">
                <div className="hero-main">
                    <div className="hero-introduction">
                        <h1 id="hero-title" aria-label={profile.full_name || displayName}><span className="name-mask"><span>{displayName}.</span></span>{familyName && <span className="name-mask family-name"><span>{familyName}</span></span>}</h1>
                        <div className="hero-note"><div><p className="hero-role">{profile.job_title || 'Développeur web'}</p><p>{profile.tagline || 'Du développement web aux solutions informatiques.'}</p></div><a href="#contact" className="button">Parlons de votre projet<Arrow diagonal /></a></div>
                    </div>
                    <figure className="hero-portrait">{profile.photo_url ? <div className="portrait-frame"><img src={profile.photo_url} alt={profile.full_name || displayName} width="384" height="404" fetchPriority="high" /></div> : <div className="portrait-fallback">{displayName}</div>}<figcaption><span>{profile.full_name || displayName}</span><span>Logiciel & support IT</span></figcaption></figure>
                </div>
                <div className="hero-bottom"><a href="#projets" className="text-link">Explorer les réalisations<Arrow down /></a><p>Concevoir. Développer. Accompagner.</p></div>
            </section>

            <section className="work-section page-gutter" id="projets" aria-labelledby="work-title">
                <div className="section-heading reveal"><h2 id="work-title">Projets choisis.</h2><p>Des besoins réels, des solutions web.<br />Explorez le travail derrière chaque projet.</p></div>
                <div className="project-layout">
                    <div className="project-index reveal"><div className="project-filters" role="group" aria-label="Filtrer les projets">{filters.map(item => <button type="button" key={item} aria-pressed={filter === item} onClick={() => changeProject(() => { setFilter(item); setSelectedId(projects.find(project => item === 'Tous' || project.category === item)?.id); })}>{item}</button>)}</div>
                        <div className="project-selectors" role="group" aria-label="Choisir un projet">{visibleProjects.map(project => <button type="button" key={project.id} aria-pressed={selectedProject?.id === project.id} onClick={() => changeProject(() => setSelectedId(project.id))}><span>{project.title}<small>{project.category || 'Projet web'}</small></span><Arrow diagonal /></button>)}</div>
                        <p className="project-count" aria-live="polite">{visibleProjects.length} projet{visibleProjects.length > 1 ? 's' : ''} à découvrir</p>
                    </div>
                    <div className="project-showcase reveal" aria-live="polite" aria-atomic="true"><ProjectShowcase project={selectedProject} /></div>
                </div>
            </section>

            <section className="about-section page-gutter" id="apropos" aria-labelledby="about-title">
                <div className="about-heading reveal"><h2 id="about-title">Le web.<br />Et le terrain.</h2><p>Développement & informatique</p></div>
                <div className="about-copy"><p className="about-biography reveal">{profile.bio || 'Je construis des applications web et accompagne les besoins informatiques au quotidien.'}</p><div className="about-details reveal"><div><h3>Langues</h3>{entries.language?.length ? entries.language.map(item => <p key={item.id}>{item.title}<span>{item.description}</span></p>) : <p>À découvrir prochainement.</p>}</div><div><h3>En dehors du code</h3>{entries.interest?.length ? <ul>{entries.interest.map(item => <li key={item.id}>{item.title}{item.description && <span> — {item.description}</span>}</li>)}</ul> : <p>À découvrir prochainement.</p>}</div></div></div>
            </section>

            {!!entries.skill?.length && <section className="skills-section page-gutter" aria-labelledby="skills-title"><div className="section-heading reveal"><h2 id="skills-title">Les outils du métier.</h2><p>Des compétences qui relient<br />l’application à son environnement.</p></div><dl className="skills-grid">{entries.skill.map((item, index) => <div className="reveal" style={{'--reveal-order': index % 4}} key={item.id}><dt>{item.title}</dt><dd>{item.description}</dd></div>)}</dl></section>}

            <section className="career-section page-gutter" id="parcours" aria-labelledby="career-title"><div className="section-heading reveal"><h2 id="career-title">Mon parcours.</h2><div className="career-switch" role="group" aria-label="Afficher le parcours">{[['experience', 'Expériences'], ['education', 'Formations']].map(([type, label]) => <button key={type} type="button" aria-pressed={career === type} onClick={() => setCareer(type)}>{label}</button>)}</div></div><ol className="career-list" key={career}>{entries[career]?.length ? entries[career].map((item, index) => <li className="reveal career-row" style={{'--reveal-order': index}} key={item.id}><p className="career-period">{item.period || 'Parcours'}</p><div><h3>{item.title}</h3><p>{item.organization}</p>{item.description && <p className="career-description">{item.description}</p>}{item.url && <a href={item.url} className="text-link" target="_blank" rel="noopener noreferrer">En savoir plus<Arrow diagonal /></a>}</div></li>) : <li className="career-empty">Le parcours sera présenté prochainement.</li>}</ol></section>

            <section className="contact-section page-gutter" id="contact" aria-labelledby="contact-title"><div className="contact-intro"><h2 className="reveal" id="contact-title">On en parle ?</h2><p className="reveal">Un projet à construire, un besoin informatique ou une collaboration. La conversation commence ici.</p><div className="contact-links reveal">{profile.email && <a className="contact-email" href={`mailto:${profile.email}`}>{profile.email}<Arrow diagonal /></a>}{profile.phone && <a href={`tel:${profile.phone.replace(/[^+\d]/g, '')}`}>{profile.phone}</a>}<div className="social-links">{profile.github_url && <a href={profile.github_url} target="_blank" rel="noopener noreferrer">GitHub<Arrow diagonal /></a>}{profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">LinkedIn<Arrow diagonal /></a>}{profile.cv_url && <a href={profile.cv_url}>Télécharger le CV<Arrow diagonal /></a>}</div></div></div><div className="contact-form-panel reveal"><ContactForm /></div></section>
        </main>
        <footer className="site-footer page-gutter"><div className="footer-top"><p>{profile.location || 'Portfolio personnel'}</p><a href="#accueil" className="text-link">Retour en haut<Arrow down /></a></div><a href="#accueil" className="footer-name" aria-label="Retour au début du portfolio">{displayName}.<Arrow diagonal /></a><div className="footer-bottom"><p>© {new Date().getFullYear()} {profile.full_name || displayName}</p><a href="/admin">Espace administrateur</a></div></footer>
    </div>;
}
