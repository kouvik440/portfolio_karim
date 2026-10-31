import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import '../css/admin.css';

const config = JSON.parse(document.getElementById('admin-config').textContent);
const sections = [
    ['profile', 'Profil & CV'], ['education', 'Formations'], ['experience', 'Expériences'],
    ['skill', 'Compétences techniques'], ['project', 'Projets'], ['language', 'Langues'],
    ['interest', 'Centres d’intérêt'], ['contact', 'Coordonnées'], ['messages', 'Messages reçus'],
];
const profileKeys = ['full_name', 'display_name', 'job_title', 'tagline', 'bio', 'email', 'phone', 'location', 'github_url', 'linkedin_url'];

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
    const id = `field-${name}`;
    const attributes = { id, name, defaultValue: value ?? '', 'aria-invalid': !!errors[name], 'aria-describedby': errors[name] ? `${id}-error` : undefined, ...props };
    return <label className="admin-field" htmlFor={id}>{label}{textarea ? <textarea {...attributes} /> : <input {...attributes} />}{errors[name] && <span className="admin-error" id={`${id}-error`}>{errors[name][0]}</span>}</label>;
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
    </form><details className="admin-setup"><summary>Première connexion ?</summary><p>Créez votre compte depuis le terminal du projet :</p><code>php artisan portfolio:admin</code><p>Le mot de passe est choisi et saisi dans le terminal.</p></details></div><a href={config.home}>Retour au portfolio</a></main>;
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
            <label className="admin-field">Photo de profil<input name="photo" type="file" accept="image/jpeg,image/png,image/webp" aria-describedby="photo-help" /><small id="photo-help">JPEG, PNG ou WebP · 2 Mo maximum.</small>{state.errors.photo && <span className="admin-error">{state.errors.photo[0]}</span>}</label>
            <label className="admin-check"><input name="remove_photo" type="checkbox" value="1" />Retirer la photo actuelle</label>
            <label className="admin-field">CV au format PDF<input name="cv" type="file" accept="application/pdf" aria-describedby="cv-help" /><small id="cv-help">PDF · 2 Mo maximum. Le CV sera téléchargeable publiquement.</small>{state.errors.cv && <span className="admin-error">{state.errors.cv[0]}</span>}</label>
            <label className="admin-check"><input name="remove_cv" type="checkbox" value="1" />Retirer le CV actuel</label>
        </>}
        <p className="admin-error" role="alert">{state.notice}</p><button className="admin-primary" disabled={state.busy}>{state.busy ? 'Enregistrement…' : 'Enregistrer les modifications'}</button>
    </form></div>;
}

const entryLabels = {
    education: ['Diplôme / formation', 'Établissement', 'Année / période'],
    experience: ['Poste occupé', 'Entreprise / organisation', 'Période et durée'],
    skill: ['Domaine technique', 'Organisation', 'Période'],
    project: ['Nom du projet', 'Client / organisation', 'Année / période'],
    language: ['Langue', 'Organisation', 'Période'],
    interest: ['Centre d’intérêt', 'Organisation', 'Période'],
};

function EntryEditor({ type, entry, onSaved, onCancel }) {
    const state = useSubmission(); const labels = entryLabels[type];
    async function submit(event) {
        event.preventDefault(); const form = new FormData(event.currentTarget); const body = Object.fromEntries(form);
        body.type = type; body.is_published = form.has('is_published'); body.sort_order = Number(body.sort_order);
        body.technologies = (body.technologies || '').split(',').map(item => item.trim()).filter(Boolean);
        await state.run(async () => { await request(entry ? `${config.entriesUrl}/${entry.id}` : config.entriesUrl, {method: entry ? 'PUT' : 'POST', body}); await onSaved(entry ? 'Élément modifié.' : 'Élément ajouté.'); });
    }
    return <form className="admin-panel" onSubmit={submit}><div className="admin-panel-title"><h2>{entry ? 'Modifier' : 'Ajouter un élément'}</h2>{entry && <button type="button" className="admin-secondary" onClick={onCancel}>Annuler</button>}</div>
        <Field name="title" label={labels[0]} required maxLength={255} value={entry?.title} errors={state.errors} />
        {['education', 'experience', 'project'].includes(type) && <><Field name="organization" label={labels[1]} maxLength={255} value={entry?.organization} errors={state.errors} /><Field name="period" label={labels[2]} maxLength={120} value={entry?.period} errors={state.errors} /></>}
        {type === 'project' && <><Field name="category" label="Catégorie du projet" maxLength={120} value={entry?.category} errors={state.errors} /><Field name="technologies" label="Technologies, séparées par des virgules" value={entry?.technologies?.join(', ')} errors={state.errors} /></>}
        <Field name="description" label={type === 'language' ? 'Niveau de maîtrise' : type === 'skill' ? 'Technologies et savoir-faire' : 'Description'} textarea rows={4} maxLength={10000} value={entry?.description} errors={state.errors} />
        {['education', 'experience', 'project'].includes(type) && <Field name="url" label="Lien externe (facultatif)" type="url" maxLength={2048} value={entry?.url} errors={state.errors} />}
        <Field name="sort_order" label="Ordre d’affichage (les plus petits en premier)" type="number" min="0" max="10000" required value={entry?.sort_order ?? 0} errors={state.errors} />
        <label className="admin-check"><input name="is_published" type="checkbox" defaultChecked={entry?.is_published ?? true} />Afficher sur le portfolio public</label>
        <p className="admin-error" role="alert">{state.notice}</p><button className="admin-primary" disabled={state.busy}>{state.busy ? 'Enregistrement…' : entry ? 'Enregistrer' : 'Ajouter'}</button>
    </form>;
}

function Entries({ type, data, refresh, notify }) {
    const [editing, setEditing] = useState(null); const [version, setVersion] = useState(0); const state = useSubmission();
    const items = data.entries.filter(item => item.type === type);
    async function saved(message) { await refresh(); setEditing(null); setVersion(value => value + 1); notify(message); }
    function remove(item) {
        if (!window.confirm(`Supprimer « ${item.title} » ? Cette suppression est définitive.`)) return;
        state.run(async () => { await request(`${config.entriesUrl}/${item.id}`, {method: 'DELETE'}); if (editing?.id === item.id) setEditing(null); await saved('Élément supprimé.'); });
    }
    return <div className="admin-editor-layout"><section className="admin-entry-list"><div className="admin-panel-title"><h2>{items.length} élément{items.length > 1 ? 's' : ''}</h2><button type="button" className="admin-secondary" onClick={() => {setEditing(null); setVersion(value => value + 1);}}>Ajouter</button></div>{!items.length && <p className="admin-empty">Aucun élément pour le moment. Ajoutez le premier avec le formulaire.</p>}{items.map(item => <article className={`admin-entry ${editing?.id === item.id ? 'selected' : ''}`} key={item.id}><div><h3>{item.title}</h3><p>{[item.organization, item.period].filter(Boolean).join(' · ') || item.description || 'Sans description'}</p><span className={item.is_published ? 'publication-state' : 'draft-state'}>{item.is_published ? 'Publié' : 'Masqué'}</span></div><div className="admin-row-actions"><button type="button" onClick={() => setEditing(item)}>Modifier</button><button type="button" className="admin-danger" disabled={state.busy} onClick={() => remove(item)}>Supprimer</button></div></article>)}<p className="admin-error" role="alert">{state.notice}</p></section><EntryEditor key={`${type}-${editing?.id || 'new'}-${version}`} type={type} entry={editing} onSaved={saved} onCancel={() => setEditing(null)} /></div>;
}

function Messages() {
    const [page, setPage] = useState(1); const [data, setData] = useState(null); const [error, setError] = useState(''); const [retry, setRetry] = useState(0);
    useEffect(() => { let active = true; setError(''); setData(null); request(`${config.messagesUrl}?page=${page}`).then(value => {if (active) setData(value);}).catch(e => {if (active) setError(e.message);}); return () => {active = false;}; }, [page, retry]);
    if (error) return <div className="admin-panel"><p role="alert">{error}</p><button onClick={() => setRetry(value => value + 1)}>Réessayer</button></div>;
    if (!data) return <p role="status">Chargement des messages…</p>;
    return <section className="admin-messages"><p>{data.total} message{data.total > 1 ? 's' : ''} reçu{data.total > 1 ? 's' : ''}. Ces messages sont privés.</p>{!data.data.length && <div className="admin-panel admin-empty">Aucun message reçu pour le moment.</div>}{data.data.map(message => <article className="admin-message admin-panel" key={message.id}><div className="admin-panel-title"><h2>{message.subject}</h2><time dateTime={message.created_at}>{new Date(message.created_at).toLocaleDateString('fr-FR')}</time></div><p><strong>{message.name}</strong> · <a href={`mailto:${message.email}`}>{message.email}</a></p><p className="message-body">{message.message}</p><a className="admin-text-link" href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`}>Répondre par e-mail</a></article>)}{data.last_page > 1 && <div className="admin-pagination"><button disabled={page === 1} onClick={() => setPage(page - 1)}>Précédent</button><span>Page {page} sur {data.last_page}</span><button disabled={page === data.last_page} onClick={() => setPage(page + 1)}>Suivant</button></div>}</section>;
}

function Admin() {
    const initialView = () => sections.some(([key]) => key === window.location.hash.slice(1)) ? window.location.hash.slice(1) : 'profile';
    const [view, setView] = useState(initialView); const [open, setOpen] = useState(false); const [data, setData] = useState(null); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
    async function refresh() { const result = await request(config.dataUrl); setData(result); setError(''); }
    useEffect(() => { refresh().catch(e => setError(e.message)); const change = () => {setView(initialView()); setNotice(''); setOpen(false);}; window.addEventListener('hashchange', change); return () => window.removeEventListener('hashchange', change); }, []);
    async function logout() { try { const result = await request(config.logoutUrl, {method: 'POST'}); window.location.assign(result.redirect); } catch (e) {setError(e.message);} }
    const title = sections.find(([key]) => key === view)?.[1];
    return <div className="admin-layout"><header className="admin-sidebar"><a href="#profile" className="admin-brand">k.<span>Portfolio Karim<small>Administration</small></span></a><button type="button" className="admin-menu" aria-controls="admin-navigation" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'Fermer le menu' : 'Menu'}</button><nav className={open ? 'open' : ''} id="admin-navigation" aria-label="Administration">{sections.map(([key, label]) => <a key={key} href={`#${key}`} aria-current={view === key ? 'page' : undefined}>{label}</a>)}<a href={config.home} target="_blank" rel="noopener noreferrer">Voir le portfolio ↗</a><button type="button" onClick={logout}>Se déconnecter</button></nav></header><main className="admin-content"><div className="admin-page-title"><div><h1>{title}</h1><p>Le portfolio de {data?.profile?.display_name || 'Karim'}, à votre image.</p></div><a href={config.home} className="admin-secondary" target="_blank" rel="noopener noreferrer">Aperçu public ↗</a></div><p className="admin-success" role="status" aria-live="polite">{notice}</p>{error ? <div className="admin-panel"><p className="admin-error" role="alert">{error}</p><button type="button" onClick={() => refresh().catch(e => setError(e.message))}>Réessayer</button></div> : !data ? <p role="status">Chargement du portfolio…</p> : view === 'profile' || view === 'contact' ? <ProfileForm key={`${view}-${data.profile?.updated_at || 'new'}`} data={data} contactOnly={view === 'contact'} refresh={refresh} notify={setNotice} /> : view === 'messages' ? <Messages /> : <Entries key={view} type={view} data={data} refresh={refresh} notify={setNotice} />}</main></div>;
}

createRoot(document.getElementById('admin-root')).render(config.login ? <Login /> : <Admin />);
