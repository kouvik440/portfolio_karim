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
    ['users', 'Utilisateurs & Rôles'],
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

function Auth() {
    const [mode, setMode] = useState(config.register ? 'register' : 'login');
    const state = useSubmission();

    async function handleLogin(event) {
        event.preventDefault();
        const body = Object.fromEntries(new FormData(event.currentTarget));
        await state.run(async () => {
            const data = await request(config.loginUrl, { method: 'POST', body });
            window.location.assign(data.redirect);
        });
    }

    async function handleRegister(event) {
        event.preventDefault();
        const body = Object.fromEntries(new FormData(event.currentTarget));
        await state.run(async () => {
            const data = await request(config.registerUrl, { method: 'POST', body });
            window.location.assign(data.redirect);
        });
    }

    return (
        <main className="admin-login">
            <a href={config.home} className="admin-brand">
                k. <span>Portfolio Karim</span>
            </a>
            <div className="login-panel">
                <div className="admin-auth-tabs" role="tablist">
                    <button
                        type="button"
                        className={`admin-auth-tab ${mode === 'login' ? 'is-active' : ''}`}
                        onClick={() => { setMode('login'); state.setNotice(''); }}
                    >
                        Se connecter
                    </button>
                    <button
                        type="button"
                        className={`admin-auth-tab ${mode === 'register' ? 'is-active' : ''}`}
                        onClick={() => { setMode('register'); state.setNotice(''); }}
                    >
                        Créer un compte
                    </button>
                </div>

                {mode === 'login' ? (
                    <>
                        <h1>Connexion administrateur</h1>
                        <p>Accédez à votre espace pour gérer vos projets et actualités.</p>
                        <form onSubmit={handleLogin}>
                            <Field name="email" label="Adresse e-mail" type="email" required autoComplete="username" errors={state.errors} />
                            <Field name="password" label="Mot de passe" type="password" required autoComplete="current-password" errors={state.errors} />
                            <button className="admin-primary" disabled={state.busy}>
                                {state.busy ? 'Connexion…' : 'Se connecter'}
                            </button>
                            <p className="admin-error" role="alert">{state.notice}</p>
                            <div className="admin-auth-toggle">
                                <span>Pas encore de compte ?</span>
                                <button type="button" onClick={() => { setMode('register'); state.setNotice(''); }}>
                                    Créer un compte
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <>
                        <h1>Créer un compte administrateur</h1>
                        <p>Configurez vos accès pour gérer votre portfolio en toute autonomie.</p>
                        <form onSubmit={handleRegister}>
                            <Field name="name" label="Nom complet" required placeholder="ex. Karim OUEDRAOGO" errors={state.errors} />
                            <Field name="email" label="Adresse e-mail" type="email" required autoComplete="email" placeholder="votre-email@example.com" errors={state.errors} />
                            <Field name="password" label="Mot de passe (8 caractères minimum)" type="password" required autoComplete="new-password" errors={state.errors} />
                            <Field name="password_confirmation" label="Confirmez le mot de passe" type="password" required autoComplete="new-password" errors={state.errors} />
                            <button className="admin-primary" disabled={state.busy}>
                                {state.busy ? 'Création du compte…' : 'Créer mon compte'}
                            </button>
                            <p className="admin-error" role="alert">{state.notice}</p>
                            <div className="admin-auth-toggle">
                                <span>Vous avez déjà un compte ?</span>
                                <button type="button" onClick={() => { setMode('login'); state.setNotice(''); }}>
                                    Se connecter
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </main>
    );
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
            <label className="admin-field">Photo de profil<input name="photo" type="file" accept="image/jpeg,image/png,image/webp" aria-describedby="photo-help" /><small id="photo-help">JPEG, PNG ou WebP · 10 Mo maximum.</small>{state.errors.photo && <span className="admin-error">{state.errors.photo[0]}</span>}</label>
            <label className="admin-check"><input name="remove_photo" type="checkbox" value="1" />Retirer la photo actuelle</label>
            <label className="admin-field">CV au format PDF<input name="cv" type="file" accept="application/pdf" aria-describedby="cv-help" /><small id="cv-help">PDF · 10 Mo maximum. Le CV sera téléchargeable publiquement.</small>{state.errors.cv && <span className="admin-error">{state.errors.cv[0]}</span>}</label>
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

function CoverUpload({ entry, errors }) {
    return <>
        {entry?.cover_url && <img className="admin-project-cover" src={entry.cover_url} alt={entry.cover_alt || entry.title} />}
        <label className="admin-field">Photo de couverture (facultatif)<input type="file" name="cover" accept="image/jpeg,image/png,image/webp" /><small>JPEG, PNG ou WebP · 10 Mo maximum.</small>{errors.cover && <span className="admin-error">{errors.cover[0]}</span>}</label>
        {entry?.cover_url && <label className="admin-check"><input type="checkbox" name="remove_cover" value="1" />Retirer la couverture actuelle</label>}
    </>;
}

function AdvancedMedia({ entry, errors }) {
    return <>
        <Field name="cover_alt" label="Description de l’image (accessibilité)" value={entry?.cover_alt} maxLength={255} errors={errors} />
        {!!entry?.gallery_urls?.length && <div className="admin-gallery">{entry.gallery_urls.map((url, index) => <img key={url} src={url} alt={`${entry.title}, capture ${index + 1}`} />)}</div>}
        <label className="admin-field">Photos complémentaires (galerie)<input type="file" name="gallery[]" multiple accept="image/jpeg,image/png,image/webp" /><small>3 images maximum, 10 Mo chacune. Remplace la galerie actuelle.</small>{Object.entries(errors).filter(([key]) => key.startsWith('gallery')).map(([key, messages]) => <span className="admin-error" key={key}>{messages[0]}</span>)}</label>
        {!!entry?.gallery_urls?.length && <label className="admin-check"><input type="checkbox" name="remove_gallery" value="1" />Retirer toute la galerie actuelle</label>}
    </>;
}

function EntryEditor({ type, entry, onSaved, onCancel }) {
    const state = useSubmission(); const labels = entryLabels[type];
    const isNews = type === 'news';
    const isProject = type === 'project';
    const hasAdvancedNews = Boolean(entry?.category || entry?.url || entry?.slug || entry?.gallery_urls?.length);
    const hasAdvancedProject = Boolean(entry?.organization || entry?.period || entry?.demo_url || entry?.problem || entry?.solution || entry?.contribution || entry?.result || entry?.gallery_urls?.length || (entry?.sort_order && entry.sort_order > 0));

    async function submit(event) {
        event.preventDefault(); const form = new FormData(event.currentTarget); const body = Object.fromEntries(form);
        body.type = type; body.is_published = form.has('is_published');
        body.sort_order = body.sort_order !== undefined && body.sort_order !== '' ? Number(body.sort_order) : 0;
        body.technologies = (body.technologies || '').split(',').map(item => item.trim()).filter(Boolean);
        let payload = body;
        let method = entry ? 'PUT' : 'POST';
        if (['project', 'news'].includes(type)) {
            form.set('type', type); form.set('is_published', body.is_published ? '1' : '0');
            form.set('is_featured', form.has('is_featured') ? '1' : '0');
            form.set('sort_order', String(body.sort_order || 0));
            form.set('technologies', JSON.stringify(body.technologies));
            if (!form.get('cover')?.size) form.delete('cover');
            if (!form.getAll('gallery[]').some(file => file.size)) form.delete('gallery[]');
            if (entry) form.set('_method', 'PUT');
            payload = form; method = 'POST';
        }
        await state.run(async () => { await request(entry ? `${config.entriesUrl}/${entry.id}` : config.entriesUrl, {method, body: payload}); await onSaved(entry ? 'Élément modifié.' : 'Élément ajouté.'); });
    }

    return <form id="entry-editor" className="admin-panel" tabIndex={-1} aria-labelledby="entry-editor-title" onSubmit={submit}>
        <div className="admin-panel-title">
            <div>
                <h2 id="entry-editor-title">{entry ? `Modifier ${isNews ? 'la publication' : isProject ? 'le projet' : 'l’élément'}` : isNews ? 'Nouvelle publication' : isProject ? 'Nouveau projet' : 'Ajouter un élément'}</h2>
                {(isNews || isProject) && <span className="admin-quick-badge">⚡ Formulaire simplifié</span>}
            </div>
            {entry && <button type="button" className="admin-secondary" onClick={onCancel}>Annuler</button>}
        </div>

        <Field name="title" label={labels[0]} required maxLength={255} value={entry?.title} errors={state.errors} />

        {/* Champs principaux pour un projet */}
        {isProject && <>
            <div className="admin-form-grid">
                <Field name="category" label="Catégorie (ex. Application web, API REST)" maxLength={120} value={entry?.category} errors={state.errors} />
                <Field name="technologies" label="Technologies (séparées par des virgules)" value={entry?.technologies?.join(', ')} placeholder="Laravel, React, MySQL..." errors={state.errors} />
            </div>
            <Field name="description" label="Description synthétique" textarea rows={3} maxLength={10000} value={entry?.description} placeholder="Présentation rapide du projet..." errors={state.errors} />
            <Field name="url" label="Lien du projet ou GitHub (facultatif)" type="url" maxLength={2048} value={entry?.url} placeholder="https://github.com/..." errors={state.errors} />
            <CoverUpload entry={entry} errors={state.errors} />
            <div className="admin-form-grid">
                <label className="admin-check"><input name="is_published" type="checkbox" defaultChecked={entry?.is_published ?? true} />Afficher sur le portfolio public</label>
                <label className="admin-check"><input type="checkbox" name="is_featured" defaultChecked={entry?.is_featured ?? false} />Mettre ce projet en avant (vedette)</label>
            </div>

            <details className="admin-details" defaultOpen={hasAdvancedProject}>
                <summary>Étude de cas détaillée & options complémentaires (facultatif) ▾</summary>
                <div className="admin-details-content">
                    <div className="admin-form-grid">
                        <Field name="organization" label="Client / organisation" maxLength={255} value={entry?.organization} errors={state.errors} />
                        <Field name="period" label="Période ou durée" maxLength={120} value={entry?.period} errors={state.errors} />
                    </div>
                    <Field name="demo_url" label="Lien de démonstration interactive" type="url" value={entry?.demo_url} errors={state.errors} />
                    <Field name="problem" label="Le besoin / problème" textarea rows={2} maxLength={10000} value={entry?.problem} errors={state.errors} />
                    <Field name="solution" label="La solution réalisée" textarea rows={2} maxLength={10000} value={entry?.solution} errors={state.errors} />
                    <Field name="contribution" label="Votre contribution réelle" textarea rows={2} maxLength={10000} value={entry?.contribution} errors={state.errors} />
                    <Field name="result" label="Résultats vérifiés / impact" textarea rows={2} maxLength={10000} value={entry?.result} errors={state.errors} />
                    <div className="admin-form-grid">
                        <Field name="slug" label="Adresse personnalisée (auto si vide)" maxLength={180} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={entry?.slug} errors={state.errors} />
                        <Field name="sort_order" label="Ordre d’affichage" type="number" min="0" max="10000" value={entry?.sort_order ?? 0} errors={state.errors} />
                    </div>
                    <AdvancedMedia entry={entry} errors={state.errors} />
                </div>
            </details>
            {entry?.public_url && <a className="admin-text-link" href={entry.public_url} target="_blank" rel="noopener noreferrer">Voir l’étude de cas publiée ↗</a>}
        </>}

        {/* Champs principaux pour une actualité / publication */}
        {isNews && <>
            <Field name="description" required label="Texte / contenu de la publication" textarea rows={5} maxLength={10000} value={entry?.description} placeholder="Partagez une actualité, une réalisation, un événement..." errors={state.errors} />
            <CoverUpload entry={entry} errors={state.errors} />
            <input type="hidden" name="sort_order" value={entry?.sort_order ?? 0} />
            <label className="admin-check"><input name="is_published" type="checkbox" defaultChecked={entry?.is_published ?? true} />Publier immédiatement sur le portfolio</label>

            <details className="admin-details" defaultOpen={hasAdvancedNews}>
                <summary>Options avancées (date, thème, lien, galerie...) ▾</summary>
                <div className="admin-details-content">
                    <div className="admin-form-grid">
                        <Field name="occurred_on" label="Date de l’événement" type="date" value={entry?.occurred_on || new Date().toISOString().slice(0, 10)} errors={state.errors} />
                        <Field name="category" label="Thème (événement, rencontre, projet...)" maxLength={120} value={entry?.category} errors={state.errors} />
                    </div>
                    <Field name="url" label="Lien externe lié (facultatif)" type="url" maxLength={2048} value={entry?.url} errors={state.errors} />
                    <Field name="slug" label="Adresse de la publication (automatique si vide)" maxLength={180} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={entry?.slug} errors={state.errors} />
                    <AdvancedMedia entry={entry} errors={state.errors} />
                </div>
            </details>
            {entry?.public_url && <a className="admin-text-link" href={entry.public_url} target="_blank" rel="noopener noreferrer">Voir la publication en ligne ↗</a>}
        </>}

        {/* Autres éléments : formations, expériences, compétences, langues, centres d'intérêt */}
        {!isProject && !isNews && <>
            {['education', 'experience'].includes(type) && <div className="admin-form-grid">
                <Field name="organization" label={labels[1]} maxLength={255} value={entry?.organization} errors={state.errors} />
                <Field name="period" label={labels[2]} maxLength={120} value={entry?.period} errors={state.errors} />
            </div>}
            <Field name="description" label={type === 'language' ? 'Niveau de maîtrise' : type === 'skill' ? 'Technologies et savoir-faire' : 'Description'} textarea rows={3} maxLength={10000} value={entry?.description} errors={state.errors} />
            {['education', 'experience'].includes(type) && <Field name="url" label="Lien externe (facultatif)" type="url" maxLength={2048} value={entry?.url} errors={state.errors} />}
            <div className="admin-form-grid">
                <Field name="sort_order" label="Ordre d’affichage" type="number" min="0" max="10000" required value={entry?.sort_order ?? 0} errors={state.errors} />
                <label className="admin-check" style={{ marginTop: '28px' }}><input name="is_published" type="checkbox" defaultChecked={entry?.is_published ?? true} />Afficher sur le portfolio</label>
            </div>
        </>}

        <p className="admin-error" role="alert">{state.notice}</p>
        <button className="admin-primary" disabled={state.busy}>
            {state.busy ? 'Enregistrement…' : entry ? 'Enregistrer les modifications' : isNews ? 'Publier l’actualité' : isProject ? 'Enregistrer le projet' : 'Ajouter'}
        </button>
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

function UsersAndRoles({ notify }) {
    const [subTab, setSubTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingRole, setEditingRole] = useState(null);
    const [selectedPerms, setSelectedPerms] = useState([]);
    const state = useSubmission();

    async function loadData() {
        try {
            setLoading(true);
            const [usersRes, rolesRes] = await Promise.all([
                request(config.usersUrl),
                request(config.rolesUrl),
            ]);
            setUsers(usersRes.users || []);
            setRoles(rolesRes.roles || []);
            setPermissions(rolesRes.permissions || []);
            setCurrentUserId(usersRes.current_user_id);
        } catch (err) {
            state.setNotice(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadData(); }, []);

    async function handleCreateUser(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const body = Object.fromEntries(new FormData(form));
        if (body.role_id) {
            body.roles = [Number(body.role_id)];
        }
        await state.run(async () => {
            const res = await request(config.usersUrl, { method: 'POST', body });
            form.reset();
            notify(res.message || 'Utilisateur créé avec succès.');
            await loadData();
        });
    }

    async function handleUpdateUserRole(user, roleId) {
        if (!roleId) return;
        await state.run(async () => {
            const res = await request(`${config.usersUrl}/${user.id}/roles`, {
                method: 'PUT',
                body: { roles: [Number(roleId)] },
            });
            notify(res.message || 'Rôle mis à jour.');
            await loadData();
        });
    }

    async function handleDeleteUser(user) {
        if (!window.confirm(`Supprimer le compte de « ${user.name} » (${user.email}) ? Cette action est irréversible.`)) return;
        await state.run(async () => {
            const res = await request(`${config.usersUrl}/${user.id}`, { method: 'DELETE' });
            notify(res.message || 'Utilisateur supprimé.');
            await loadData();
        });
    }

    function startEditRole(role = null) {
        setEditingRole(role);
        if (role) {
            setSelectedPerms((role.permissions || []).map(p => p.id));
        } else {
            setSelectedPerms([]);
        }
        state.setNotice('');
    }

    function togglePermission(permId) {
        setSelectedPerms(prev =>
            prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
        );
    }

    async function handleSaveRole(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const body = Object.fromEntries(new FormData(form));
        body.permissions = selectedPerms;
        await state.run(async () => {
            const url = editingRole ? `${config.rolesUrl}/${editingRole.id}` : config.rolesUrl;
            const method = editingRole ? 'PUT' : 'POST';
            const res = await request(url, { method, body });
            notify(res.message || 'Rôle enregistré.');
            startEditRole(null);
            form.reset();
            await loadData();
        });
    }

    async function handleDeleteRole(role) {
        if (!window.confirm(`Supprimer définitivement le rôle « ${role.name} » ?`)) return;
        await state.run(async () => {
            const res = await request(`${config.rolesUrl}/${role.id}`, { method: 'DELETE' });
            notify(res.message || 'Rôle supprimé.');
            if (editingRole?.id === role.id) startEditRole(null);
            await loadData();
        });
    }

    const permissionsByModule = permissions.reduce((acc, p) => {
        const mod = p.module || 'Général';
        if (!acc[mod]) acc[mod] = [];
        acc[mod].push(p);
        return acc;
    }, {});

    return (
        <div>
            <div className="admin-subnav" role="tablist">
                <button
                    type="button"
                    className={`admin-subnav-button ${subTab === 'users' ? 'is-active' : ''}`}
                    onClick={() => setSubTab('users')}
                >
                    👥 Utilisateurs & Rôles affectés ({users.length})
                </button>
                <button
                    type="button"
                    className={`admin-subnav-button ${subTab === 'roles' ? 'is-active' : ''}`}
                    onClick={() => setSubTab('roles')}
                >
                    🛡️ Rôles & Permissions ({roles.length})
                </button>
            </div>

            {subTab === 'users' ? (
                <div className="admin-editor-layout">
                    <section className="admin-entry-list">
                        <div className="admin-panel-title">
                            <h2>{users.length} utilisateur{users.length > 1 ? 's' : ''}</h2>
                        </div>
                        {loading ? (
                            <p role="status">Chargement des utilisateurs…</p>
                        ) : (
                            users.map(u => (
                                <article className="admin-entry" key={u.id}>
                                    <div>
                                        <h3>
                                            {u.name} {u.id === currentUserId && <span className="admin-quick-badge">Vous</span>}
                                        </h3>
                                        <p>{u.email} · Inscrit le {new Date(u.created_at).toLocaleDateString('fr-FR')}</p>
                                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                            <span className={`admin-role-badge ${u.roles?.[0]?.slug || ''}`}>
                                                {u.roles?.map(r => r.name).join(', ') || 'Sans rôle'}
                                            </span>
                                            {u.id !== currentUserId && (
                                                <select
                                                    aria-label={`Changer le rôle de ${u.name}`}
                                                    style={{ fontSize: '13px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #daddd4', background: '#fff' }}
                                                    value={u.roles?.[0]?.id || ''}
                                                    onChange={e => handleUpdateUserRole(u, e.target.value)}
                                                >
                                                    {roles.map(r => (
                                                        <option key={r.id} value={r.id}>{r.name}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </div>
                                    {u.id !== currentUserId && (
                                        <div className="admin-row-actions">
                                            <button
                                                type="button"
                                                className="admin-danger"
                                                disabled={state.busy}
                                                onClick={() => handleDeleteUser(u)}
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    )}
                                </article>
                            ))
                        )}
                        <p className="admin-error" role="alert">{state.notice}</p>
                    </section>

                    <form className="admin-panel" onSubmit={handleCreateUser}>
                        <div className="admin-panel-title">
                            <h2>Créer un utilisateur & affecter un rôle</h2>
                        </div>
                        <p style={{ color: '#60645b', fontSize: '14px', marginTop: '-10px' }}>
                            Le rôle choisi détermine les permissions accordées sur le portfolio.
                        </p>
                        <Field name="name" label="Nom complet" required placeholder="ex. Karim OUEDRAOGO" errors={state.errors} />
                        <Field name="email" label="Adresse e-mail" type="email" required placeholder="utilisateur@example.com" errors={state.errors} />

                        <label className="admin-field" htmlFor="field-user-role">
                            Rôle à affecter
                            <select id="field-user-role" name="role_id" defaultValue={roles[0]?.id || ''}>
                                {roles.map(r => (
                                    <option key={r.id} value={r.id}>{r.name} — {r.description || r.slug}</option>
                                ))}
                            </select>
                        </label>

                        <Field name="password" label="Mot de passe (8 caractères minimum)" type="password" required autoComplete="new-password" errors={state.errors} />
                        <Field name="password_confirmation" label="Confirmez le mot de passe" type="password" required autoComplete="new-password" errors={state.errors} />
                        <p className="admin-error" role="alert">{state.notice}</p>
                        <button className="admin-primary" disabled={state.busy}>
                            {state.busy ? 'Création en cours…' : 'Créer l’utilisateur'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="admin-editor-layout">
                    <section className="admin-entry-list">
                        <div className="admin-panel-title">
                            <h2>{roles.length} rôle{roles.length > 1 ? 's' : ''} configuré{roles.length > 1 ? 's' : ''}</h2>
                            <button type="button" className="admin-secondary" onClick={() => startEditRole(null)}>
                                Nouveau rôle
                            </button>
                        </div>
                        {loading ? (
                            <p role="status">Chargement des rôles…</p>
                        ) : (
                            roles.map(r => {
                                const isSystem = ['super-admin', 'editor', 'moderator'].includes(r.slug);
                                const isSelected = editingRole?.id === r.id;
                                return (
                                    <article className={`admin-entry ${isSelected ? 'selected' : ''}`} key={r.id}>
                                        <div>
                                            <h3>
                                                {r.name} <small style={{ fontSize: '12px', color: '#60645b' }}>({r.slug})</small>
                                                {isSystem && <span className="admin-quick-badge" style={{ marginLeft: '8px' }}>Système</span>}
                                            </h3>
                                            <p>{r.description || 'Aucune description'}</p>
                                            <p style={{ fontSize: '13px', color: '#456f3a', marginTop: '4px' }}>
                                                {r.users_count || 0} utilisateur{(r.users_count || 0) > 1 ? 's' : ''} associé{(r.users_count || 0) > 1 ? 's' : ''}
                                            </p>
                                            <div className="admin-role-tags">
                                                {r.permissions?.length ? (
                                                    r.permissions.map(p => (
                                                        <span className="admin-perm-pill" key={p.id}>
                                                            {p.name}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span style={{ fontSize: '12px', color: '#888' }}>Aucune permission attribuée</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="admin-row-actions">
                                            <button type="button" onClick={() => startEditRole(r)}>
                                                Modifier permissions
                                            </button>
                                            {!isSystem && (
                                                <button
                                                    type="button"
                                                    className="admin-danger"
                                                    disabled={state.busy}
                                                    onClick={() => handleDeleteRole(r)}
                                                >
                                                    Supprimer
                                                </button>
                                            )}
                                        </div>
                                    </article>
                                );
                            })
                        )}
                        <p className="admin-error" role="alert">{state.notice}</p>
                    </section>

                    <form className="admin-panel" key={editingRole?.id || 'new-role'} onSubmit={handleSaveRole}>
                        <div className="admin-panel-title">
                            <h2>{editingRole ? `Modifier : ${editingRole.name}` : 'Créer un rôle'}</h2>
                            {editingRole && (
                                <button type="button" className="admin-secondary" onClick={() => startEditRole(null)}>
                                    Annuler
                                </button>
                            )}
                        </div>
                        <p style={{ color: '#60645b', fontSize: '14px', marginTop: '-10px' }}>
                            Définissez le nom du rôle et cochez les permissions associées.
                        </p>

                        <Field name="name" label="Nom du rôle" required defaultValue={editingRole?.name || ''} placeholder="ex. Gestionnaire Projets" errors={state.errors} />
                        <Field name="description" label="Description du rôle" textarea rows={2} defaultValue={editingRole?.description || ''} placeholder="Rôle dédié à la saisie des réalisations..." errors={state.errors} />

                        <div style={{ marginTop: '8px' }}>
                            <h3 style={{ fontSize: '15px', marginBottom: '12px' }}>Affectation des permissions :</h3>
                            {Object.entries(permissionsByModule).map(([moduleName, perms]) => (
                                <div className="admin-permissions-group" key={moduleName}>
                                    <h4>{moduleName}</h4>
                                    <div className="admin-permissions-list">
                                        {perms.map(p => {
                                            const isChecked = selectedPerms.includes(p.id);
                                            return (
                                                <label className="admin-perm-check" key={p.id}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => togglePermission(p.id)}
                                                    />
                                                    <div>
                                                        <strong>{p.name}</strong>
                                                        {p.description && <span className="admin-perm-desc">{p.description}</span>}
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className="admin-error" role="alert">{state.notice}</p>
                        <button className="admin-primary" disabled={state.busy}>
                            {state.busy ? 'Enregistrement…' : editingRole ? 'Mettre à jour le rôle' : 'Créer le rôle'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
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
    return <div className="admin-layout"><a className="skip-link" href="#admin-content">Aller au contenu</a>{open && <button className="menu-backdrop admin-backdrop" type="button" tabIndex={-1} aria-label="Fermer le menu" onClick={() => {setOpen(false);menuButton.current?.focus();}} />}<header className="admin-sidebar"><a href="#profile" className="admin-brand">k.<span>Portfolio Karim<small>Administration</small></span></a><button ref={menuButton} type="button" className="admin-menu" aria-controls="admin-navigation" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'Fermer le menu' : 'Menu'}</button><nav onClick={navigate} className={open ? 'open' : ''} id="admin-navigation" aria-label="Administration">{sections.map(([key, label]) => <a key={key} href={`#${key}`} aria-current={view === key ? 'page' : undefined}>{label}</a>)}<a href={config.home} target="_blank" rel="noopener noreferrer">Voir le portfolio ↗</a><button type="button" onClick={logout}>Se déconnecter</button></nav></header><main className="admin-content" id="admin-content" tabIndex={-1}><div className="admin-page-title"><div><h1 id="admin-page-heading" tabIndex={-1}>{title}</h1><p>Le portfolio de {data?.profile?.display_name || 'Karim'}, à votre image.</p></div><a href={config.home} className="admin-secondary" target="_blank" rel="noopener noreferrer">Aperçu public ↗</a></div><p className="admin-success" role="status" aria-live="polite">{notice}</p>{error ? <div className="admin-panel"><p className="admin-error" role="alert">{error}</p><button type="button" onClick={() => refresh().catch(e => setError(e.message))}>Réessayer</button></div> : !data ? <p role="status">Chargement du portfolio…</p> : view === 'overview' ? <Overview data={data} /> : view === 'settings' ? <Settings key={data.profile?.updated_at || 'settings'} data={data} refresh={refresh} notify={setNotice} /> : view === 'profile' || view === 'contact' ? <ProfileForm key={`${view}-${data.profile?.updated_at || 'new'}`} data={data} contactOnly={view === 'contact'} refresh={refresh} notify={setNotice} /> : view === 'messages' ? <Messages refresh={refresh} notify={setNotice} /> : view === 'users' ? <UsersAndRoles notify={setNotice} /> : <Entries key={view} type={view} data={data} refresh={refresh} notify={setNotice} />}</main></div>;
}

createRoot(document.getElementById('admin-root')).render(config.login ? <Auth /> : <Admin />);
