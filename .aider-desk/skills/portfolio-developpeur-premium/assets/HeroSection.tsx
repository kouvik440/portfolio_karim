import { motion, useReducedMotion } from 'motion/react';

export type HeroProfile = {
  name: string;
  headline: string;
  summary: string;
  location?: string;
  githubUrl?: string;
  contactHref?: string;
  projectsHref?: string;
};

export default function HeroSection({ profile }: { profile: HeroProfile }) {
  const reduceMotion = useReducedMotion();
  const transition = { duration: reduceMotion ? 0 : 0.55, ease: 'easeOut' as const };

  return (
    <section aria-labelledby="hero-title" className="portfolio-container grid min-h-[75svh] grid-cols-1 items-center gap-12 py-24 lg:grid-cols-12 lg:gap-16">
      <div className="min-w-0 lg:col-span-8">
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
          className="mb-6 text-sm font-medium tracking-[0.18em] uppercase text-[var(--portfolio-accent)]"
        >
          Développeur · Création d'expériences numériques
        </motion.p>
        <motion.h1
          id="hero-title"
          initial={reduceMotion ? false : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: reduceMotion ? 0 : 0.1 }}
          className="max-w-5xl text-[clamp(2.6rem,7vw,6.2rem)] leading-[1.05] font-semibold tracking-[-0.06em]"
        >
          {profile.name}<span className="text-[var(--portfolio-accent)]">.</span>
        </motion.h1>
        <p className="mt-6 max-w-2xl text-xl font-semibold leading-snug text-[var(--portfolio-text)] sm:text-2xl">
          {profile.headline}
        </p>
        <p className="mt-4 max-w-xl text-base leading-8 text-[var(--portfolio-muted)] sm:text-lg">
          {profile.summary}
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a className="portfolio-focus inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--portfolio-accent)] px-7 font-semibold text-[#08101b] transition-opacity hover:opacity-90" href={profile.projectsHref ?? '#projets'}>
            Découvrir mes projets
          </a>
          <a className="portfolio-focus inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--portfolio-line)] px-7 font-semibold text-white transition-colors hover:bg-white/10" href={profile.contactHref ?? '#contact'}>
            Me contacter
          </a>
        </div>
        {profile.location && <p className="mt-8 text-sm text-[var(--portfolio-muted)]">{profile.location}</p>}
      </div>
      <aside className="portfolio-card relative min-w-0 overflow-hidden p-7 lg:col-span-4" aria-label="Aperçu de mon univers technique">
        <p className="mb-5 text-xs tracking-widest text-[var(--portfolio-muted)] uppercase">Mon approche</p>
        <div className="space-y-4 font-mono text-sm">
          <p><span className="text-[var(--portfolio-accent)]">const</span> focus = <span className="text-white">'Produit utile'</span>;</p>
          <p><span className="text-[var(--portfolio-accent)]">const</span> design = <span className="text-white">'Clarté'</span>;</p>
          <p><span className="text-[var(--portfolio-accent)]">const</span> code = <span className="text-white">'Qualité'</span>;</p>
        </div>
        {profile.githubUrl && (
          <a className="portfolio-focus mt-7 inline-flex min-h-11 items-center text-sm font-medium text-[var(--portfolio-accent)] underline-offset-4 hover:underline" href={profile.githubUrl} target="_blank" rel="noopener noreferrer">
            Voir mon GitHub ↗
          </a>
        )}
      </aside>
    </section>
  );
}
