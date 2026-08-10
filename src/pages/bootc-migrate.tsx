import type {ReactNode} from 'react';
import ProjectLanding from '@site/src/components/ProjectLanding';
import {getProject} from '@site/src/data/projects';

export default function BootcMigratePage(): ReactNode {
  return <ProjectLanding project={getProject('bootc-migrate')!} />;
}
