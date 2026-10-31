import { useRef, useState } from 'react';
import Arrow from './Arrow';

export default function ContactForm() {
    const [status, setStatus] = useState('idle');
    const [errors, setErrors] = useState({});
    const [notice, setNotice] = useState('');
    const formRef = useRef(null);

    async function submit(event) {
        event.preventDefault();
        if (status === 'sending') return;
        setStatus('sending'); setErrors({}); setNotice('');
        try {
            const response = await fetch(document.getElementById('app').dataset.contactUrl, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content },
                body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))),
            });
            if (response.status === 422) {
                const data = await response.json(); setErrors(data.errors || {}); setStatus('error');
                setNotice('Vérifiez les champs indiqués.');
                requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus());
                return;
            }
            if (!response.ok) {
                throw new Error(response.status === 429 ? 'Trop de tentatives. Réessayez dans une minute.' : response.status === 419 ? 'La session a expiré. Actualisez la page avant de réessayer.' : 'L’envoi n’a pas abouti. Réessayez dans un instant.');
            }
            const data = await response.json(); setStatus('success'); setNotice(data.message); formRef.current.reset();
        } catch (error) {
            setStatus('error'); setNotice(error instanceof TypeError ? 'Connexion interrompue. Vérifiez votre accès à Internet et réessayez.' : error.message);
        }
    }

    function fieldProps(name) {
        return { id: name, name, 'aria-invalid': !!errors[name], 'aria-describedby': errors[name] ? `${name}-error` : name === 'message' ? 'message-hint' : undefined };
    }
    const error = name => errors[name] && <span className="field-error" id={`${name}-error`}>{errors[name][0]}</span>;

    return <form ref={formRef} onSubmit={submit} className="contact-form">
        <div className="form-row"><label htmlFor="name">Votre nom<input {...fieldProps('name')} autoComplete="name" required maxLength={120} placeholder="Comment vous appelez-vous ?" />{error('name')}</label><label htmlFor="email">Votre e-mail<input {...fieldProps('email')} autoComplete="email" type="email" required maxLength={254} placeholder="vous@exemple.fr" />{error('email')}</label></div>
        <label htmlFor="subject">Vous avez en tête…<select {...fieldProps('subject')} defaultValue="Un site web"><option>Un site web</option><option>Une application</option><option>Une collaboration</option><option>Autre</option></select>{error('subject')}</label>
        <label htmlFor="message">Quelques mots sur votre idée<textarea {...fieldProps('message')} rows={4} required minLength={20} maxLength={5000} placeholder="Le besoin, les envies, ce que vous aimeriez construire…" />{error('message')}</label>
        <p id="message-hint" className="small-copy">De 20 à 5 000 caractères. Vos coordonnées servent uniquement à répondre à votre demande.</p>
        <div hidden><label htmlFor="website">Site web<input id="website" name="website" tabIndex={-1} autoComplete="off" /></label></div>
        <button className="button" disabled={status === 'sending'} type="submit">{status === 'sending' ? 'Envoi en cours…' : 'Envoyer mon message'}<Arrow /></button>
        <p className={`form-notice ${status}`} aria-live="polite" role="status">{notice}</p>
    </form>;
}

