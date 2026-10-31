import { useState } from 'react';
import Arrow from './Arrow';

function PostPhotos({ post }) {
    const images = [post.cover_url, ...(post.gallery_urls || [])].filter(Boolean);
    const [failed, setFailed] = useState([]);
    const visible = images.filter(url => !failed.includes(url));
    if (!visible.length) return null;
    return <div className={`post-photos post-photos-${visible.length}`}>{visible.map((url, index) => <a href={url} target="_blank" rel="noopener noreferrer" key={url} aria-label={`Ouvrir la photo ${index + 1} : ${post.title}`}><img src={url} alt={index === 0 ? post.cover_alt || post.title : `${post.title}, photo ${index + 1}`} width="1200" height="900" loading="lazy" onError={() => setFailed(current => [...current, url])} /></a>)}</div>;
}

function Post({ post, profile, detail = false }) {
    const date = post.occurred_on ? new Date(`${post.occurred_on}T12:00:00`).toLocaleDateString('fr-FR', {day: 'numeric', month: 'long', year: 'numeric'}) : null;
    const description = post.description || '';
    const excerpt = !detail && description.length > 420;
    return <article className={`news-post ${detail ? 'news-post-detail' : ''}`}>
        <div className="post-author"><span className="post-monogram" aria-hidden="true">{(profile.display_name || 'K').charAt(0)}</span><div><p>{profile.full_name || profile.display_name}</p>{date && <time dateTime={post.occurred_on}>{date}</time>}</div>{post.category && <span className="post-category">{post.category}</span>}</div>
        <div className="post-copy">{detail ? <h1>{post.title}</h1> : <h2><a href={post.detail_url}>{post.title}<Arrow diagonal /></a></h2>}<p>{excerpt ? `${description.slice(0, 420).trimEnd()}…` : description}</p>{excerpt && <a href={post.detail_url} className="text-link">Lire la suite<Arrow diagonal /></a>}</div>
        <PostPhotos post={post} />
        <div className="post-links">{!detail && <a href={post.detail_url} className="text-link">Voir la publication<Arrow diagonal /></a>}{post.url && <a href={post.url} className="text-link" target="_blank" rel="noopener noreferrer">Lien associé<Arrow diagonal /></a>}</div>
    </article>;
}

export default function NewsPage({ page, post, profile, newsUrl, homeUrl }) {
    return <main className="news-page page-gutter" id="contenu" tabIndex={-1}>
        <a className="text-link news-back" href={post ? newsUrl : homeUrl}><span aria-hidden="true">←</span>{post ? 'Toutes les actualités' : 'Retour au portfolio'}</a>
        {post ? <div className="news-reading"><Post post={post} profile={profile} detail /><a className="text-link" href={newsUrl}>Explorer les autres publications<Arrow /></a></div> : <>
            <header className="news-heading"><p>Journal professionnel</p><h1>Actualités.</h1><p>Événements, rencontres et solutions déployées.<br />Des expériences à partager, au fil du parcours.</p></header>
            <div className="news-layout"><aside className="news-aside"><p>{profile.display_name || 'Karim'}<span>Sur le terrain, au quotidien.</span></p><a className="text-link" href={`${homeUrl}#contact`}>Échangeons<Arrow diagonal /></a></aside><div className="news-feed">
                {page.posts.length ? page.posts.map(item => <Post key={item.id} post={item} profile={profile} />) : <div className="news-empty"><h2>Le journal s’ouvre bientôt.</h2><p>Les premières actualités seront partagées ici.</p></div>}
                {page.last_page > 1 && <nav className="news-pagination" aria-label="Pages des actualités">{page.previous_url && <a className="text-link" href={page.previous_url}>← Précédentes</a>}<span>Page {page.current_page} sur {page.last_page}</span>{page.next_url && <a className="text-link" href={page.next_url}>Suivantes →</a>}</nav>}
            </div></div>
        </>}
    </main>;
}
