import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import '../css/admin.css';

const config = JSON.parse(document.getElementById('admin-config').textContent);
const sections = [
    ['overview', 'Vue d’ensemble'],
    ['profile', 'Profil & CV'], ['education', 'Formations'], ['experience', 'Expériences'],
    ['skill', 'Compétences techniques'], ['project', 'Projets'], ['news', 'Actualités'], ['language', 'Langues'],
    ['interest', 'Centres d’intérêt'], ['contact', 'Coordonnées'], ['messages', 'Messages reçus'], ['settings', 'Textes & paramètres'],
];
const profileKeys = ['full_name', 'display_name', 'job_title', 'tagline', 'bio', 'email', 'phone', 'location', 'github_url', 'linkedin_url', 'availability'];

async function request(url, { method = 'GET', body } = {}) {
    const headers = { Accept: 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content };
    if (body && !(body instanceof FormData)) { headers['Content-Type'] = 'application/json'; body = JSON.stringify(body); }
    const response = await fetch(url, { method, headers, body });
    if (response.status === 401) { window.location.assign(config.loginUrl); throw new Error('Reconnectez-vous pour continuer.'); }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const message = response.status === 419 ? 'Session expirée. Actualisez la page et réessayez.' : response.status === 429 ? 'Trop de tentatives. Réessayez dans une minute.' : data.message || 'La demande n’a pas abouti.';
        const error = new Error(message); error.fields = data.errors || {}; throw error;
    }
    return data;
}

function Field({ name, label, value, errors = {}, textarea = false, ...props }) {
    const id = `field-${name.replace(/[^\w-]/g, '-')}`;
    const errorName = name.replace(/\[([^\]]+)\]/g, '.$1');
    const attributes = { id, name, defaultValue: value ?? '', 'aria-invalid': !!errors[errorName], 'aria-describedby': errors[errorName] ? `${id}-error` : undefined, ...props };
    return <label className="admin-field" htmlFor={id}>{label}{textarea ? <textarea {...attributes} /> : <input {...attributes} />}{errors[errorName] && <span className="admin-error" id={`${id}-error`}>{errors[errorName][0]}</span>}</label>;
}

function useSubmission() {
    const [busy, setBusy] = useState(false); const [errors, setErrors] = useState({}); const [notice, setNotice] = useState('');
    async function run(action) {
        if (busy) return;
        setBusy(true); setErrors({}); setNotice('');
        try { await action(); } catch (error) {
            setErrors(error.fields || {}); setNotice(error instanceof TypeError ? 'Connexion interrompue. Réessayez.' : error.message);
            requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus());
        } finally { setBusy(false); }
    }
    return { busy, errors, notice, setNotice, run };
}

function Login() {
    const state = useSubmission();
    return <main className="admin-login"><a href={config.home} className="admin-brand">k. <span>Portfolio Karim</span></a><div className="login-panel"><h1>Connexion administrateur</h1><p>Votre espace pour faire évoluer le portfolio.</p><form onSubmit={event => { event.preventDefault(); const body = Object.fromEntries(new FormData(event.currentTarget)); state.run(async () => { const data = await request(config.loginUrl, {method: 'POST', body}); window.location.assign(data.redirect); }); }}>
        <Field name="email" label="Adresse e-mail" type="email" required autoComplete="username" errors={state.errors} />
        <Field name="password" label="Mot de passe" type="password" required autoComplete="current-password" errors={state.errors} />
        <button className="admin-primary" disabled={state.busy}>{state.busy ? 'Connexion…' : 'Se connecter'}</button><p className="admin-error" role="alert">{state.notice}</p>
    </form></div></main>;
}

function ProfileForm({ data, contactOnly, refresh, notify }) {
    const profile = data.profile || {}; const state = useSubmission();
    async function submit(event) {
        event.preventDefault(); const form = event.currentTarget; const body = new FormData(form);
        for (const name of profileKeys) { if (!body.has(name)) body.set(name, profile[name] || ''); }
        await state.run(async () => { await request(config.profileUrl, {method: 'POST', body}); await refresh(); notify('Les informations sont enregistrées et visibles sur le portfolio.'); });
    }
    return <div className="admin-settings"><aside><h2>{contactOnly ? 'Restons en contact' : 'Votre présentation'}</h2><p>{contactOnly ? 'Ces coordonnées apparaissent dans la section contact du portfolio.' : 'Votre identité, votre photo et votre CV. Le fichier du CV peut être remplacé sans modifier le code.'}</p>{data.photo_url && <img className="admin-portrait" src={data.photo_url} alt={profile.full_name} />}{data.cv_url && <a className="admin-text-link" href={data.cv_url}>Télécharger le CV actuel</a>}</aside><form className="admin-panel" onSubmit={submit} encType="multipart/form-data">
        {contactOnly ? <><Field name="email" label="E-mail public" type="email" maxLength={254} value={profile.email} errors={state.errors} /><Field name="phone" label="Téléphone" type="tel" maxLength={60} value={profile.phone} errors={state.errors} /><Field name="location" label="Ville / localisation" maxLength={255} value={profile.location} errors={state.errors} /><Field name="github_url" label="Lien GitHub" type="url" value={profile.github_url} errors={state.errors} /><Field name="linkedin_url" label="Lien LinkedIn" type="url" value={profile.linkedin_url} errors={state.errors} /></> : <>
            <Field name="full_name" label="Nom complet" required maxLength={255} value={profile.full_name} errors={state.errors} /><div className="admin-form-grid"><Field name="display_name" label="Nom affiché en grand" required maxLength={60} value={profile.display_name} errors={state.errors} /><Field name="job_title" label="Intitulé de métier" required maxLength={255} value={profile.job_title} errors={state.errors} /></div>
            <Field name="tagline" label="Phrase de présentation" maxLength={255} value={profile.tagline} errors={state.errors} /><Field name="bio" label="Profil / biographie" textarea rows={6} maxLength={10000} value={profile.bio} errors={state.errors} />
            <Field name="availability" label="Disponibilité (facultatif, vide pour masquer)" maxLength={180} value={profile.availability} errors={state.errors} />
            <label className="admin-field">Photo de profil<input name="photo" type="file" accept="image/jpeg,image/png,image/webp" aria-describedby="photo-help" /><small id="photo-help">JPEG, PNG ou WebP · 2 Mo maximum.</small>{state.errors.photo && <span className="admin-error">{state.errors.photo[0]}</span>}</label>
            <label className="admin-check"><input name="remove_photo" type="checkbox" value="1" />Retirer la photo actuelle</label>
            <label className="admin-field">CV au format PDF<input name="cv" type="file" accept="application/pdf" aria-describedby="cv-help" /><small id="cv-help">PDF · 2 Mo maximum. Le CV sera téléchargeable publiquement.</small>{state.errors.cv && <span className="admin-error">{state.errors.cv[0]}</span>}</label>
            <label className="admin-check"><input name="remove_cv" type="checkbox" value="1" />Retirer le CV actuel</label>
        </>}
        <p className="admin-error" role="alert">{state.notice}</p><button className="admin-primary" disabled={state.busy}>{state.busy ? 'Enregistrement…' : 'Enregistrer les modifications'}</button>
    </form></div>;
}

const entryLabels = {
    news: ['Titre de la publication', 'Organisation', 'Date'],
    education: ['Diplôme / formation', 'Établissement', 'Année / période'],
    experience: ['Poste occupé', 'Entreprise / organisation', 'Période et durée'],
    skill: ['Domaine technique', 'Organisation', 'Période'],
    project: ['Nom du projet', 'Client / organisation', 'Année / période'],
    language: ['Langue', 'Organisation', 'Période'],
    interest: ['Centre d’intérêt', 'Organisation', 'Période'],
};

function EntryMedia({ entry, errors }) {
    return <>
            {entry?.cover_url && <img className="admin-project-cover" src={entry.cover_url} alt={entry.cover_alt || entry.title} />}
            <label className="admin-field">Photo principale<input type="file" name="cover" accept="image/jpeg,image/png,image/webp" /><small>JPEG, PNG ou WebP · 2 Mo maximum · 4 096 pixels maximum.</small>{errors.cover && <span className="admin-error">{errors.cover[0]}</span>}</label>
            <Field name="cover_alt" label="Description de l’image pour l’accessibilité" value={entry?.cover_alt} maxLength={255} errors={errors} />
            <label className="admin-check"><input type="checkbox" name="remove_cover" value="1" />Retirer la couverture actuelle</label>
            {!!entry?.gallery_urls?.length && <div className="admin-gallery">{entry.gallery_urls.map((url, index) => <img key={url} src={url} alt={`${entry.title}, capture ${index + 1}`} />)}</div>}
            <label className="admin-field">Photos complémentaires<input type="file" name="gallery[]" multiple accept="image/jpeg,image/png,image/webp" /><small>3 images maximum, 1 Mo chacune. Les nouveaux fichiers remplacent la galerie actuelle.</small>{Object.entries(errors).filter(([key]) => key.startsWith('gallery')).map(([key, messages]) => <span className="admin-error" key={key}>{messages[0]}</span>)}</label>
            <label className="admin-check"><input type="checkbox" name="remove_gallery" value="1" />Retirer toute la galerie actuelle</label>
    </>;
}

function EntryEditor({ type, entry, onSaved, onCancel }) {
    const state = useSubmission(); const labels = entryLabels[type];
    async function submit(event) {
        event.preventDefault(); const form = new FormData(event.currentTarget); const body = Object.fromEntries(form);
        body.type = type; body.is_published = form.has('is_published'); body.sort_order = Number(body.sort_order);
        body.technologies = (body.technologies || '').split(',').map(item => item.trim()).filter(Boolean);
        let payload = body;
        let method = entry ? 'PUT' : 'POST';
        if (['project', 'news'].includes(type)) {
            form.set('type', type); form.set('is_published', body.is_published ? '1' : '0');
            form.set('is_featured', form.has('is_featured') ? '1' : '0');
            form.set('technologies', JSON.stringify(body.technologies));
            if (!form.get('cover')?.size) form.delete('cover');
            if (!form.getAll('gallery[]').some(file => file.size)) form.delete('gallery[]');
            if (entry) form.set('_method', 'PUT');
            payload = form; method = 'POST';
        }
        await state.run(async () => { await request(entry ? `${config.entriesUrl}/${entry.id}` : config.entriesUrl, {method, body: payload}); await onSaved(entry ? 'Élément modifié.' : 'Élément ajouté.'); });
    }
    return <form id="entry-editor" className="admin-panel" tabIndex={-1} aria-labelledby="entry-editor-title" onSubmit={submit}><div className="admin-panel-title"><h2 id="entry-editor-title">{entry ? 'Modifier' : 'Ajouter un élément'}</h2>{entry && <button type="button" className="admin-secondary" onClick={onCancel}>Annuler</button>}</div>
        <Field name="title" label={labels[0]} required maxLength={255} value={entry?.title} errors={state.errors} />
        {['education', 'experience', 'project'].includes(type) && <><Field name="organization" label={labels[1]} maxLength={255} value={entry?.organization} errors={state.errors} /><Field name="period" label={labels[2]} maxLength={120} value={entry?.period} errors={state.errors} /></>}
        {type === 'project' && <><Field name="category" label="Catégorie du projet" maxLength={120} value={entry?.category} errors={state.errors} /><Field name="technologies" label="Technologies, séparées par des virgules" value={entry?.technologies?.join(', ')} errors={state.errors} /></>}
        <Field name="description" required={type === 'news'} label={type === 'language' ? 'Niveau de maîtrise' : type === 'skill' ? 'Technologies et savoir-faire' : 'Description'} textarea rows={4} maxLength={10000} value={entry?.description} errors={state.errors} />
        {['education', 'experience', 'project', 'news'].includes(type) && <Field name="url" label="Lien externe (facultatif)" type="url" maxLength={2048} value={entry?.url} errors={state.errors} />}
        {type === 'project' && <>
            <Field name="slug" label="Adresse de l’étude de cas (automatique si vide)" maxLength={180} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={entry?.slug} errors={state.errors} />
            <Field name="demo_url" label="Lien de démonstration (facultatif)" type="url" value={entry?.demo_url} errors={state.errors} />
            {[['problem', 'Le besoin / problème'], ['solution', 'La solution'], ['contribution', 'Votre contribution réelle'], ['result', 'Résultats vérifiés (laisser vide si non mesurés)']].map(([name, label]) => <Field key={name} name={name} label={label} textarea rows={3} maxLength={10000} value={entry?.[name]} errors={state.errors} />)}
            <EntryMedia entry={entry} errors={state.errors} />
            <label className="admin-check"><input type="checkbox" name="is_featured" defaultChecked={entry?.is_featured ?? false} />Mettre ce projet en avant</label>
            {entry?.public_url && <a className="admin-text-link" href={entry.public_url} target="_blank" rel="noopener noreferrer">Voir l’étude de cas publiée ↗</a>}
        </>}
        {type === 'news' && <>
            <Field name="occurred_on" label="Date de la publication / de l’événement" type="date" value={entry?.occurred_on || new Date().toISOString().slice(0,10)} errors={state.errors} />
            <Field name="category" label="Thème (événement, rencontre, solution…)" maxLength={120} value={entry?.category} errors={state.errors} />
            <Field name="slug" label="Adresse de la publication (automatique si vide)" maxLength={180} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={entry?.slug} errors={state.errors} />
            <EntryMedia entry={entry} errors={state.errors} />
            {entry?.public_url && <a className="admin-text-link" href={entry.public_url} target="_blank" rel="noopener noreferrer">Voir la publication ↗</a>}
        </>}
        {type === 'news' ? <input type="hidden" name="sort_order" value={entry?.sort_order ?? 0} /> : <Field name="sort_order" label="Ordre d’affichage (les plus petits en premier)" type="number" min="0" max="10000" required value={entry?.sort_order ?? 0} errors={state.errors} />}
        <label className="admin-check"><input name="is_published" type="checkbox" defaultChecked={entry?.is_published ?? type !== 'news'} />Afficher sur le portfolio public</label>
        <p className="admin-error" role="alert">{state.notice}</p><button className="admin-primary" disabled={state.busy}>{state.busy ? 'Enregistrement…' : entry ? 'Enregistrer' : 'Ajouter'}</button>
    </form>;
}

function Entries({ type, data, refresh, notify }) {
    const [editing, setEditing] = useState(null); const [version, setVersion] = useState(0); const state = useSubmission();
    const items = data.entries.filter(item => item.type === type);
    function edit(item = null) {
        setEditing(item); setVersion(value => value + 1);
        requestAnimationFrame(() => {
            const editor = document.getElementById('entry-editor');
            editor?.focus({preventScroll: true});
            if (window.matchMedia('(max-width: 700px)').matches) editor?.scrollIntoView({block: 'start'});
        });
    }
    async function saved(message) { await refresh(); setEditing(null); setVersion(value => value + 1); notify(message); }
    function remove(item) {
        if (!window.confirm(`Supprimer « ${item.title} » ? Cette suppression est définitive.`)) return;
        state.run(async () => { await request(`${config.entriesUrl}/${item.id}`, {method: 'DELETE'}); if (editing?.id === item.id) setEditing(null); await saved('Élément supprimé.'); });
    }
    return <div className="admin-editor-layout"><section className="admin-entry-list"><div className="admin-panel-title"><h2>{items.length} élément{items.length > 1 ? 's' : ''}</h2><button type="button" className="admin-secondary" onClick={() => edit()}>Ajouter</button></div>{!items.length && <p className="admin-empty">Aucun élément pour le moment. Ajoutez le premier avec le formulaire.</p>}{items.map(item => <article className={`admin-entry ${editing?.id === item.id ? 'selected' : ''}`} key={item.id}><div><h3>{item.title}</h3><p>{[item.organization, item.period].filter(Boolean).join(' · ') || item.description || 'Sans description'}</p><span className={item.is_published ? 'publication-state' : 'draft-state'}>{item.is_published ? 'Publié' : 'Masqué'}</span></div><div className="admin-row-actions"><button type="button" onClick={() => edit(item)}>Modifier</button><button type="button" className="admin-danger" disabled={state.busy} onClick={() => remove(item)}>Supprimer</button></div></article>)}<p className="admin-error" role="alert">{state.notice}</p></section><EntryEditor key={`${type}-${editing?.id || 'new'}-${version}`} type={type} entry={editing} onSaved={saved} onCancel={() => setEditing(null)} /></div>;
}

function Overview({ data }) {
    const stats = data.stats || {};
    const completion = [['Identité', !!data.profile?.full_name, 'profile'], ['Photo', !!data.photo_url, 'profile'], ['CV', !!data.cv_url, 'profile'], ['Coordonnées', !!data.profile?.email || !!data.profile?.phone, 'contact'], ['Projet publié', !!stats.published_projects, 'project']];
    const projects = data.entries.filter(entry => entry.type === 'project');
    return <div className="admin-overview"><section className="admin-metrics" aria-label="État du portfolio">{[['Projets publiés', stats.published_projects || 0, 'project'], ['Projets en brouillon', stats.draft_projects || 0, 'project'], ['Messages non lus', stats.unread_messages || 0, 'messages']].map(([label, value, target]) => <a key={label} href={`#${target}`}><span>{label}</span><strong>{value}</strong></a>)}</section><div className="admin-overview-grid"><section className="admin-panel"><div className="admin-panel-title"><h2>Vos projets</h2><a className="admin-text-link" href="#project">Gérer les projets</a></div>{projects.length ? projects.slice(0, 4).map(project => <a className="admin-overview-row" href="#project" key={project.id}><span>{project.title}<small>{project.category || 'Projet web'}</small></span><span className={project.is_published ? 'publication-state' : 'draft-state'}>{project.is_published ? 'Publié' : 'Brouillon'}</span></a>) : <p className="admin-empty">Ajoutez votre première réalisation.</p>}</section><section className="admin-panel"><h2>Votre présence en ligne</h2><p className="admin-completion">{completion.filter(([, done]) => done).length} éléments configurés sur {completion.length}</p>{completion.map(([label, done, target]) => <a className="admin-overview-row" href={`#${target}`} key={label}><span>{label}</span><span className={done ? 'publication-state' : 'draft-state'}>{done ? 'Prêt' : 'À compléter'}</span></a>)}</section></div><section className="admin-panel admin-overview-actions"><div><h2>Faites évoluer votre portfolio</h2><p>Publiez une réalisation, actualisez votre parcours ou adaptez les textes à votre prochaine candidature.</p></div><a className="admin-primary" href="#project">Ajouter un projet</a></section></div>;
}

const contentLabels = {
    hero_cta: 'Bouton principal', hero_footer: 'Phrase de bas du premier écran', work_heading: 'Titre des projets', work_intro: 'Introduction des projets',
    about_heading: 'Titre de la présentation', about_caption: 'Sous-texte de la présentation', skills_heading: 'Titre des compétences', skills_intro: 'Introduction des compétences',
    career_heading: 'Titre du parcours', contact_heading: 'Titre du contact', contact_intro: 'Introduction du contact', empty_projects: 'Texte quand aucun projet n’est publié',
};

function Settings({ data, refresh, notify }) {
    const state = useSubmission(); const profile = data.profile || {}; const content = {...data.content_defaults, ...profile.content};
    async function submit(event) {
        event.preventDefault(); const body = new FormData(event.currentTarget);
        state.run(async () => { await request(config.settingsUrl, {method: 'POST', body}); await refresh(); notify('Textes et paramètres enregistrés.'); });
    }
    return <div className="admin-settings"><aside><h2>Les mots et l’identité</h2><p>Les textes du site, son thème par défaut et les informations utilisées par les moteurs de recherche. Les visiteurs peuvent choisir leur propre thème.</p></aside><form className="admin-panel" onSubmit={submit}><h2>Apparence & référencement</h2><label className="admin-field" htmlFor="default-theme">Thème par défaut du site<select id="default-theme" name="default_theme" defaultValue={profile.default_theme || 'system'}><option value="system">Suivre le système du visiteur</option><option value="dark">Graphite sombre</option><option value="light">Éditorial clair</option></select></label><Field name="meta_title" label="Titre pour les moteurs de recherche" maxLength={120} value={profile.meta_title} errors={state.errors} /><Field name="meta_description" label="Description pour les moteurs de recherche" textarea rows={3} maxLength={320} value={profile.meta_description} errors={state.errors} /><p className="admin-help">Sans valeur, le titre et la description utilisent automatiquement votre profil.</p><h2>Textes du portfolio</h2>{Object.entries(data.content_defaults || {}).map(([name, fallback]) => <Field key={name} name={`content[${name}]`} label={contentLabels[name] || name} textarea={name.includes('intro') || name === 'empty_projects'} rows={3} maxLength={name === 'hero_cta' ? 60 : 2000} value={content[name] ?? fallback} errors={state.errors} />)}<p className="admin-error" role="alert">{state.notice}</p><button className="admin-primary" disabled={state.busy}>{state.busy ? 'Enregistrement…' : 'Enregistrer les textes et paramètres'}</button></form></div>;
}

function Messages({ refresh, notify }) {
    const [page, setPage] = useState(1); const [data, setData] = useState(null); const [error, setError] = useState(''); const [retry, setRetry] = useState(0);
    useEffect(() => { let active = true; setError(''); setData(null); request(`${config.messagesUrl}?page=${page}`).then(value => {if (active) setData(value);}).catch(e => {if (active) setError(e.message);}); return () => {active = false;}; }, [page, retry]);
    if (error) return <div className="admin-panel"><p role="alert">{error}</p><button onClick={() => setRetry(value => value + 1)}>Réessayer</button></div>;
    if (!data) return <p role="status">Chargement des messages…</p>;
    async function changeMessage(message, remove = false) {
        if (remove && !window.confirm(`Supprimer définitivement le message de ${message.name} ?`)) return;
        try {
            await request(`${config.messagesUrl}/${message.id}`, {method: remove ? 'DELETE' : 'PATCH'});
            await refresh(); notify(remove ? 'Message supprimé.' : 'État de lecture mis à jour.');
            if (remove && data.data.length === 1 && page > 1) setPage(page - 1); else setRetry(value => value + 1);
        } catch (failure) {setError(failure.message);}
    }
    return <section className="admin-messages"><p>{data.total} message{data.total > 1 ? 's' : ''} reçu{data.total > 1 ? 's' : ''}. Ces messages sont privés.</p>{!data.data.length && <div className="admin-panel admin-empty">Aucun message reçu pour le moment.</div>}{data.data.map(message => <article className="admin-message admin-panel" key={message.id}><div className="admin-panel-title"><h2>{message.subject}</h2><time dateTime={message.created_at}>{new Date(message.created_at).toLocaleDateString('fr-FR')}</time></div><p><strong>{message.name}</strong> · <a href={`mailto:${message.email}`}>{message.email}</a> <span className={message.read_at ? 'draft-state' : 'publication-state'}>{message.read_at ? 'Lu' : 'Non lu'}</span></p><p className="message-body">{message.message}</p><div className="admin-message-actions"><a className="admin-text-link" href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`}>Répondre par e-mail</a><button className="admin-secondary" type="button" onClick={() => changeMessage(message)}>{message.read_at ? 'Marquer non lu' : 'Marquer comme lu'}</button><button type="button" className="admin-danger" onClick={() => changeMessage(message, true)}>Supprimer</button></div></article>)}{data.last_page > 1 && <div className="admin-pagination"><button disabled={page === 1} onClick={() => setPage(page - 1)}>Précédent</button><span>Page {page} sur {data.last_page}</span><button disabled={page === data.last_page} onClick={() => setPage(page + 1)}>Suivant</button></div>}</section>;
}

function Admin() {
    const initialView = () => sections.some(([key]) => key === window.location.hash.slice(1)) ? window.location.hash.slice(1) : 'overview';
    const menuButton = useRef(null);
    const [view, setView] = useState(initialView); const [open, setOpen] = useState(false); const [data, setData] = useState(null); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
    async function refresh() { const result = await request(config.dataUrl); setData(result); setError(''); }
    useEffect(() => { refresh().catch(e => setError(e.message)); const change = () => {setView(initialView()); setNotice(''); setOpen(false); requestAnimationFrame(() => {const title = document.getElementById('admin-page-heading');title?.focus({preventScroll: true});if (window.matchMedia('(max-width: 1100px)').matches) window.scrollTo({top: 0, behavior: 'instant'});});}; window.addEventListener('hashchange', change); return () => window.removeEventListener('hashchange', change); }, []);
    useEffect(() => {
        const close = event => { if (event.key === 'Escape' && open) {setOpen(false);menuButton.current?.focus();} };
        const desktop = window.matchMedia('(min-width: 1101px)');
        const resize = () => {if (desktop.matches) setOpen(false);};
        document.addEventListener('keydown', close);desktop.addEventListener('change', resize);
        return () => {document.removeEventListener('keydown', close);desktop.removeEventListener('change', resize);};
    }, [open]);
    useEffect(() => {
        if (!open) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {document.body.style.overflow = previous;};
    }, [open]);
    function navigate(event) {
        const link = event.target.closest('a');
        if (!link) return;
        setOpen(false);
        requestAnimationFrame(() => {
            if (link.getAttribute('href')?.startsWith('#')) {
                document.getElementById('admin-page-heading')?.focus({preventScroll: true});
                if (window.matchMedia('(max-width: 1100px)').matches) window.scrollTo({top: 0, behavior: 'instant'});
            } else menuButton.current?.focus();
        });
    }
    async function logout() { try { const result = await request(config.logoutUrl, {method: 'POST'}); window.location.assign(result.redirect); } catch (e) {setError(e.message);} }
    const title = sections.find(([key]) => key === view)?.[1];
    return <div className="admin-layout"><a className="skip-link" href="#admin-content">Aller au contenu</a>{open && <button className="menu-backdrop admin-backdrop" type="button" tabIndex={-1} aria-label="Fermer le menu" onClick={() => {setOpen(false);menuButton.current?.focus();}} />}<header className="admin-sidebar"><a href="#profile" className="admin-brand">k.<span>Portfolio Karim<small>Administration</small></span></a><button ref={menuButton} type="button" className="admin-menu" aria-controls="admin-navigation" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'Fermer le menu' : 'Menu'}</button><nav onClick={navigate} className={open ? 'open' : ''} id="admin-navigation" aria-label="Administration">{sections.map(([key, label]) => <a key={key} href={`#${key}`} aria-current={view === key ? 'page' : undefined}>{label}</a>)}<a href={config.home} target="_blank" rel="noopener noreferrer">Voir le portfolio ↗</a><button type="button" onClick={logout}>Se déconnecter</button></nav></header><main className="admin-content" id="admin-content" tabIndex={-1}><div className="admin-page-title"><div><h1 id="admin-page-heading" tabIndex={-1}>{title}</h1><p>Le portfolio de {data?.profile?.display_name || 'Karim'}, à votre image.</p></div><a href={config.home} className="admin-secondary" target="_blank" rel="noopener noreferrer">Aperçu public ↗</a></div><p className="admin-success" role="status" aria-live="polite">{notice}</p>{error ? <div className="admin-panel"><p className="admin-error" role="alert">{error}</p><button type="button" onClick={() => refresh().catch(e => setError(e.message))}>Réessayer</button></div> : !data ? <p role="status">Chargement du portfolio…</p> : view === 'overview' ? <Overview data={data} /> : view === 'settings' ? <Settings key={data.profile?.updated_at || 'settings'} data={data} refresh={refresh} notify={setNotice} /> : view === 'profile' || view === 'contact' ? <ProfileForm key={`${view}-${data.profile?.updated_at || 'new'}`} data={data} contactOnly={view === 'contact'} refresh={refresh} notify={setNotice} /> : view === 'messages' ? <Messages refresh={refresh} notify={setNotice} /> : <Entries key={view} type={view} data={data} refresh={refresh} notify={setNotice} />}</main></div>;
}

createRoot(document.getElementById('admin-root')).render(config.login ? <Login /> : <Admin />);
