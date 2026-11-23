import { useState } from 'react';
import Arrow from './Arrow';

function BentoCard({ project, isFeatured = false }) {
    const [failedImage, setFailedImage] = useState(false);
    const hasImage = !failedImage && Boolean(project.cover_url);
    const isGithub = project.url?.includes('github.com');

    return (
        <article
            className={`bento-card-container reveal ${isFeatured ? 'bento-card-container--featured' : 'bento-card-container--regular'}`}
            key={project.id}
        >
            <div className="bento-rainbow-glow" aria-hidden="true" />
            <div className="bento-rainbow-border" aria-hidden="true" />

            <div className={`bento-card ${isFeatured ? 'bento-card--featured' : 'bento-card--regular'}`}>
                <div className="bento-card-media">
                    <div className={`bento-screen ${hasImage ? '' : 'bento-screen-type'}`}>
                        {hasImage ? (
                            <img
                                src={project.cover_url}
                                alt={project.cover_alt || `Aperçu du projet ${project.title}`}
                                onError={() => setFailedImage(true)}
                                width="1440"
                                height="960"
                                loading={isFeatured ? 'eager' : 'lazy'}
                                decoding="async"
                                fetchPriority={isFeatured ? 'high' : 'auto'}
                            />
                        ) : (
                            <div className="bento-type-fallback">
                                <span className="bento-type-initials">{project.title.slice(0, 2).toUpperCase()}</span>
                                <span className="bento-type-title">{project.title}</span>
                            </div>
                        )}
                    </div>
                    {isFeatured && (
                        <span className="bento-featured-pill">
                            <span className="bento-featured-dot" aria-hidden="true" />
                            Projet phare
                        </span>
                    )}
                </div>

                <div className="bento-card-body">
                    <div className="bento-card-meta">
                        <span className="bento-category">{project.category || 'Projet web'}</span>
                    </div>

                    <h3 className="bento-title">
                        {project.detail_url ? (
                            <a href={project.detail_url} className="bento-title-link">
                                {project.title}
                                <Arrow diagonal />
                            </a>
                        ) : (
                            <span>{project.title}</span>
                        )}
                    </h3>

                    <p className="bento-description">{project.description}</p>

                    {project.stack?.length > 0 && (
                        <ul className="bento-stack" aria-label={`Technologies de ${project.title}`}>
                            {project.stack.map(tech => (
                                <li key={tech} className="bento-stack-pill">{tech}</li>
                            ))}
                        </ul>
                    )}

                    <div className="bento-card-actions">
                        {project.detail_url && (
                            <a className="bento-action-link bento-action-primary" href={project.detail_url}>
                                <span>Étude de cas</span>
                                <Arrow diagonal />
                            </a>
                        )}
                        {project.url && (
                            <a
                                className="bento-action-link bento-action-secondary"
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span>{isGithub ? 'Code source' : 'Visiter le site'}</span>
                                <Arrow diagonal />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}

export default function ProjectBentoGrid({ projects = [], emptyText = 'Aucun projet pour le moment.' }) {
    const [activeFilter, setActiveFilter] = useState('Tous');

    const categories = ['Tous', ...new Set(projects.map(p => p.category).filter(Boolean))];
    const filteredProjects = projects.filter(
        p => activeFilter === 'Tous' || p.category === activeFilter
    );

    return (
        <div className="project-bento-section">
            <div className="project-filters-bar reveal">
                <div className="project-filters-pills" role="group" aria-label="Filtrer les projets">
                    {categories.map(cat => {
                        const count = cat === 'Tous'
                            ? projects.length
                            : projects.filter(p => p.category === cat).length;
                        return (
                            <button
                                key={cat}
                                type="button"
                                className={`filter-pill ${activeFilter === cat ? 'is-active' : ''}`}
                                aria-pressed={activeFilter === cat}
                                onClick={() => setActiveFilter(cat)}
                            >
                                <span>{cat}</span>
                                <span className="filter-pill-count">{count}</span>
                            </button>
                        );
                    })}
                </div>
                <p className="project-count-badge" aria-live="polite">
                    {filteredProjects.length} réalisation{filteredProjects.length > 1 ? 's' : ''}
                </p>
            </div>

            {filteredProjects.length === 0 ? (
                <div className="project-empty reveal">
                    <p>{emptyText}</p>
                </div>
            ) : (
                <div className="bento-grid">
                    {filteredProjects.map((project, index) => (
                        <BentoCard
                            key={project.id}
                            project={project}
                            isFeatured={index === 0 && filteredProjects.length > 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
