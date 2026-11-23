export default function InteractivePortrait({
    photoUrl,
    fullName,
    displayName,
    jobTitle,
}) {
    const titleName = fullName || displayName || 'Karim OUEDRAOGO';
    const displayRole = jobTitle || 'Développeur Full-Stack · Technicien IT';

    return (
        <aside className="hero-portrait-container" aria-label="Carte professionnelle">
            {/* Subtle studio backlight */}
            <div className="hero-portrait-aura" aria-hidden="true" />

            <div className="hero-portrait-card">
                {/* Photo frame */}
                <div className="hero-portrait-frame">
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt={`Portrait professionnel de ${titleName}`}
                            width="380"
                            height="420"
                            fetchPriority="high"
                            loading="eager"
                            decoding="async"
                            className="hero-portrait-img"
                        />
                    ) : (
                        <div className="portrait-fallback">
                            <span className="portrait-fallback-initials">
                                {titleName.slice(0, 2).toUpperCase()}
                            </span>
                            <span className="portrait-fallback-name">{titleName}</span>
                        </div>
                    )}
                </div>

                {/* Integrated identity panel */}
                <div className="hero-portrait-info">
                    <div className="hero-portrait-identity">
                        <h3 className="hero-portrait-name">{titleName}</h3>
                        <p className="hero-portrait-role">{displayRole}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
