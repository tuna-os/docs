import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import {BUILDSTREAM_VARIANTS, STATUS_LABELS} from '@site/src/data/projects';

import styles from './styles.module.css';

export default function BuildStreamFamily(): ReactNode {
  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Image</th>
            <th scope="col">Base runtime</th>
            <th scope="col">Desktop</th>
            <th scope="col">Build output</th>
            <th scope="col">Stage</th>
          </tr>
        </thead>
        <tbody>
          {BUILDSTREAM_VARIANTS.map((project) => {
            const buildstream = project.buildstream;
            return (
              <tr key={project.id}>
                <th scope="row">
                  <Link to={`/${project.id}`} className={styles.product}>
                    {project.mark && (
                      <img src={project.mark} alt="" width={40} height={40} loading="lazy" />
                    )}
                    <span>
                      <strong>{project.name}</strong>
                      <small>{buildstream.codename ?? 'BuildStream'}</small>
                    </span>
                  </Link>
                </th>
                <td>{buildstream.base}</td>
                <td>{buildstream.desktop}</td>
                <td className={styles.output}>
                  <code>{buildstream.image ?? buildstream.target}</code>
                  {!buildstream.image && <small>Local-only target · no public image</small>}
                </td>
                <td>{STATUS_LABELS[project.status]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
