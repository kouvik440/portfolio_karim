import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import Arrow from './Components/Arrow';
import ContactForm from './Components/ContactForm';
import ThemeToggle from './Components/ThemeToggle';
import ProjectDetail from './Components/ProjectDetail';
import NewsPage from './Components/NewsPage';

const portfolio = JSON.parse(document.getElementById('portfolio-data')?.textContent || '{}');
const profile = portfolio.profile || {};
const entries = portfolio.entries || {};
const content = portfolio.content || {};
const detail = portfolio.project_detail;
const newsPage = portfolio.news_page;
const newsPost = portfolio.news_detail;
const home = detail || newsPage || newsPost ? portfolio.home_url || '/' : '';
const text = (key, fallback) => content[key] || fallback;
const displayName = profile.display_name || 'Karim';
const lastName = (profile.full_name || '').trim().split(/\s+/).at(-1) || '';
const familyName = lastName.toLocaleLowerCase('fr') === displayName.toLocaleLowerCase('fr') ? '' : lastName.charAt(0).toLocaleUpperCase('fr') + lastName.slice(1).toLocaleLowerCase('fr');
const projects = (entries.project || []).map(project => ({ ...project, stack: project.technologies || [] }));
const navigation = [['projets', 'Projets'], ['apropos', 'À propos'], ['competences', 'Compétences'], ['parcours', 'Parcours'], ['contact', 'Contact']];

function ProjectShowcase({ project }) {
    const [failedImage, setFailedImage] = useState(false);
    if (!project) return <div className="project-empty"><p>{content.empty_projects}</p></div>;
    const image = !failedImage && project.cover_url;
    return <article className="project-stage" key={project.id}>
        <div className={`project-screen ${image ? '' : 'project-screen-type'}`}>
            {image ? <img src={image} alt={project.cover_alt || `Aperçu du projet ${project.title}`} onError={() => setFailedImage(true)} width="1440" height="960" loading="lazy" /> : <span>{project.title}</span>}
        </div>
        <div className="project-caption"><h3>{project.title}</h3><span>{project.category || 'Projet web'}</span></div>
        <p className="project-description">{project.description}</p>
        <div className="project-bottom"><ul className="stack" aria-label="Technologies">{project.stack.map(item => <li key={item}>{item}</li>)}</ul>{project.detail_url && <a className="text-link" href={project.detail_url}>Étude de cas<Arrow diagonal /></a>}{project.url && <a className="text-link" href={project.url} target="_blank" rel="noopener noreferrer">{project.url.includes('github.com') ? 'Voir le code' : 'Visiter le projet'}<Arrow diagonal /></a>}</div>
    </article>;
}

export default function PortfolioApp() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [filter, setFilter] = useState('Tous');
    const [selectedId, setSelectedId] = useState(projects[0]?.id);
    const [active, setActive] = useState('accueil');
    const [career, setCareer] = useState(entries.experience?.length ? 'experience' : 'education');
    const menuButton = useRef(null);
    const header = useRef(null);
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
        const desktop = window.matchMedia('(min-width: 901px)');
        const close = () => { if (desktop.matches) setMenuOpen(false); };
        const outside = event => { if (!header.current?.contains(event.target)) setMenuOpen(false); };
        document.addEventListener('keydown', escape);
        document.addEventListener('pointerdown', outside);
        desktop.addEventListener('change', close);
        return () => { document.removeEventListener('keydown', escape); document.removeEventListener('pointerdown', outside); desktop.removeEventListener('change', close); };
    }, [menuOpen]);

    function navigateToSection(event, id) {
        setMenuOpen(false);
        if (home || !window.matchMedia('(max-width: 900px)').matches) return;
        event.preventDefault();
        const section = document.getElementById(id);
        if (!section) return;
        history.pushState(null, '', `#${id}`);
        section.focus({preventScroll: true});
        section.scrollIntoView({block: 'start'});
    }

    useEffect(() => () => transition.current?.skipTransition(), []);

    useEffect(() => {
        if (!menuOpen) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = previous; };
    }, [menuOpen]);

    return <div className="portfolio-site">
        <a href="#contenu" className="skip-link">Aller au contenu</a>
        {menuOpen && <button className="menu-backdrop" type="button" tabIndex={-1} aria-label="Fermer le menu" onClick={() => {setMenuOpen(false);menuButton.current?.focus();}} />}
        <header ref={header} className="site-header" onBlur={event => {if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false);}}>
            <a className="wordmark" href={`${home}#accueil`} aria-label={`${displayName}, accueil`}>{displayName.charAt(0)}<span aria-hidden="true">/</span>{familyName.charAt(0) || 'O'}</a>
            <button ref={menuButton} className="menu-button" type="button" aria-expanded={menuOpen} aria-controls="navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Fermer' : 'Menu'}<span aria-hidden="true">{menuOpen ? '−' : '+'}</span></button>
            <nav onClick={event => {if (event.target.closest('a')) setMenuOpen(false);}} id="navigation" className={menuOpen ? 'is-open' : ''} aria-label="Navigation principale">{navigation.filter(([id]) => id !== 'competences' || entries.skill?.length).map(([id, label]) => <a href={`${home}#${id}`} key={id} aria-current={!home && active === id ? 'location' : undefined} onClick={event => navigateToSection(event, id)}>{label}</a>)}<a href={portfolio.news_url} aria-current={newsPage || newsPost ? 'page' : undefined}>Actualités</a>{profile.cv_url && <a className="mobile-cv" href={profile.cv_url} onClick={() => setMenuOpen(false)}>Télécharger mon CV<Arrow diagonal /></a>}</nav>
            <ThemeToggle defaultTheme={profile.default_theme} onChange={() => setMenuOpen(false)} />
            {profile.cv_url && <a className="header-cv text-link" href={profile.cv_url}>Mon CV<Arrow diagonal /></a>}
        </header>

        {newsPage || newsPost ? <NewsPage page={newsPage} post={newsPost} profile={profile} newsUrl={portfolio.news_url} homeUrl={portfolio.home_url} /> : detail ? <ProjectDetail project={detail} homeUrl={portfolio.home_url || '/'} /> : <main id="contenu" tabIndex={-1}>
            <section tabIndex={-1} className="hero page-gutter" id="accueil" aria-labelledby="hero-title">
                <div className="hero-main">
                    <div className="hero-introduction">{profile.availability && <p className="availability"><span aria-hidden="true" />{profile.availability}</p>}
                        <h1 id="hero-title" aria-label={profile.full_name || displayName}><span className="name-mask"><span>{displayName}.</span></span>{familyName && <span className="name-mask family-name"><span>{familyName}</span></span>}</h1>
                        <div className="hero-note"><div><p className="hero-role">{profile.job_title || 'Développeur web'}</p><p>{profile.tagline || 'Du développement web aux solutions informatiques.'}</p></div><a href="#contact" className="button">{text('hero_cta', 'Parlons de votre projet')}<Arrow diagonal /></a></div>
                    </div>
                    <figure className="hero-portrait">{profile.photo_url ? <div className="portrait-frame"><img src={profile.photo_url} alt={profile.full_name || displayName} width="384" height="404" fetchPriority="high" /></div> : <div className="portrait-fallback">{displayName}</div>}<figcaption><span>{profile.full_name || displayName}</span><span>Logiciel & support IT</span></figcaption></figure>
                </div>
                <div className="hero-bottom"><a href="#projets" className="text-link">Explorer les réalisations<Arrow down /></a><p>{content.hero_footer}</p></div>
            </section>

            <section tabIndex={-1} className="work-section page-gutter" id="projets" aria-labelledby="work-title">
                <div className="section-heading reveal"><h2 id="work-title">{text('work_heading', 'Projets choisis.')}</h2><p>{content.work_intro}</p></div>
                <div className="project-layout">
                    <div className="project-index reveal"><div className="project-filters" role="group" aria-label="Filtrer les projets">{filters.map(item => <button type="button" key={item} aria-pressed={filter === item} onClick={() => changeProject(() => { setFilter(item); setSelectedId(projects.find(project => item === 'Tous' || project.category === item)?.id); })}>{item}</button>)}</div>
                        <div className="project-selectors" role="group" aria-label="Choisir un projet">{visibleProjects.map(project => <button type="button" key={project.id} aria-pressed={selectedProject?.id === project.id} onClick={() => changeProject(() => setSelectedId(project.id))}><span>{project.title}<small>{project.category || 'Projet web'}</small></span><Arrow diagonal /></button>)}</div>
                        <p className="project-count" aria-live="polite">{visibleProjects.length} projet{visibleProjects.length > 1 ? 's' : ''} à découvrir</p>
                    </div>
                    <div className="project-showcase reveal" aria-live="polite" aria-atomic="true"><ProjectShowcase key={selectedProject?.id || 'empty'} project={selectedProject} /></div>
                </div>
            </section>

            <section tabIndex={-1} className="about-section page-gutter" id="apropos" aria-labelledby="about-title">
                <div className="about-heading reveal"><h2 id="about-title">{text('about_heading', 'Le web. Et le terrain.')}</h2><p>{content.about_caption}</p></div>
                <div className="about-copy"><p className="about-biography reveal">{profile.bio || 'Je construis des applications web et accompagne les besoins informatiques au quotidien.'}</p><div className="about-details reveal"><div><h3>Langues</h3>{entries.language?.length ? entries.language.map(item => <p key={item.id}>{item.title}<span>{item.description}</span></p>) : <p>À découvrir prochainement.</p>}</div><div><h3>En dehors du code</h3>{entries.interest?.length ? <ul>{entries.interest.map(item => <li key={item.id}>{item.title}{item.description && <span> — {item.description}</span>}</li>)}</ul> : <p>À découvrir prochainement.</p>}</div></div></div>
            </section>

            {!!entries.skill?.length && <section tabIndex={-1} className="skills-section page-gutter" id="competences" aria-labelledby="skills-title"><div className="section-heading reveal"><h2 id="skills-title">{content.skills_heading}</h2><p>{content.skills_intro}</p></div><dl className="skills-grid">{entries.skill.map((item, index) => <div className="reveal" style={{'--reveal-order': index % 4}} key={item.id}><dt>{item.title}</dt><dd>{item.description}</dd></div>)}</dl></section>}

            <section tabIndex={-1} className="career-section page-gutter" id="parcours" aria-labelledby="career-title"><div className="section-heading reveal"><h2 id="career-title">{text('career_heading', 'Mon parcours.')}</h2><div className="career-switch" role="group" aria-label="Afficher le parcours">{[['experience', 'Expériences'], ['education', 'Formations']].map(([type, label]) => <button key={type} type="button" aria-pressed={career === type} onClick={() => setCareer(type)}>{label}</button>)}</div></div><ol className="career-list" key={career}>{entries[career]?.length ? entries[career].map((item, index) => <li className="reveal career-row" style={{'--reveal-order': index}} key={item.id}><p className="career-period">{item.period || 'Parcours'}</p><div><h3>{item.title}</h3><p>{item.organization}</p>{item.description && <p className="career-description">{item.description}</p>}{item.url && <a href={item.url} className="text-link" target="_blank" rel="noopener noreferrer">En savoir plus<Arrow diagonal /></a>}</div></li>) : <li className="career-empty">Le parcours sera présenté prochainement.</li>}</ol></section>

            <section tabIndex={-1} className="contact-section page-gutter" id="contact" aria-labelledby="contact-title"><div className="contact-intro"><h2 className="reveal" id="contact-title">{text('contact_heading', 'On en parle ?')}</h2><p className="reveal">{content.contact_intro}</p><div className="contact-links reveal">{profile.email && <a className="contact-email" href={`mailto:${profile.email}`}>{profile.email}<Arrow diagonal /></a>}{profile.phone && <a href={`tel:${profile.phone.replace(/[^+\d]/g, '')}`}>{profile.phone}</a>}<div className="social-links">{profile.github_url && <a href={profile.github_url} target="_blank" rel="noopener noreferrer">GitHub<Arrow diagonal /></a>}{profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">LinkedIn<Arrow diagonal /></a>}{profile.cv_url && <a href={profile.cv_url}>Télécharger le CV<Arrow diagonal /></a>}</div></div></div><div className="contact-form-panel reveal"><ContactForm /></div></section>
        </main>}
        <footer className="site-footer page-gutter"><div className="footer-top"><p>{profile.location || 'Portfolio personnel'}</p><a href={`${home}#accueil`} className="text-link">Retour en haut<Arrow down /></a></div><a href={`${home}#accueil`} className="footer-name" aria-label="Retour au début du portfolio">{displayName}.<Arrow diagonal /></a><div className="footer-bottom"><p>© {new Date().getFullYear()} {profile.full_name || displayName}</p><a href="/admin">Espace administrateur</a></div></footer>
    </div>;
}
