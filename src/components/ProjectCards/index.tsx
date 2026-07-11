import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import AnimatedEmoji from '@site/src/components/AnimatedEmoji';
import {PROJECTS, STATUS_LABELS, type Project, type ProjectStatus} from '@site/src/data/projects';
import styles from './styles.module.css';

// Cards derive straight from the shared project data (src/data/projects.ts)
// — the same source each project's own landing page reads via getProject().
// A second, independently-maintained list here was the cause of this page
// silently dropping projects that existed everywhere else on the site.
const CARD_PROJECTS = PROJECTS.filter((p) => !p.external);

function ProjectCard({project}: {project: Project}) {
  const status: ProjectStatus = project.status;
  const statusClass = styles[`badge-${status}`] || '';
  const borderClass = styles[`status-${status}`] || '';
  const links = [
    project.docs ? {label: 'Documentation', to: project.docs} : null,
    {label: 'GitHub', to: project.repo},
    project.cta ?? null,
  ].filter((l): l is {label: string; to: string} => l !== null);

  return (
    <div className={`${styles.card} ${borderClass}`}>
      <div className={styles.cardTop}>
        <span className={styles.icon}><AnimatedEmoji emoji={project.emoji} size={32} /></span>
        <div>
          <h3 className={styles.name}>
            <Link to={`/${project.id}`}>{project.name}</Link>
          </h3>
          <span className={`${styles.badge} ${statusClass}`}>
            {STATUS_LABELS[status]}
          </span>
        </div>
      </div>
      <p className={styles.desc}>{project.tagline}</p>
      <div className={styles.links}>
        {links.map((link) => (
          <Link key={link.label} className={styles.link} to={link.to}>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function ProjectCards(): ReactNode {
  return (
    <div className={styles.grid}>
      {CARD_PROJECTS.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  );
}
