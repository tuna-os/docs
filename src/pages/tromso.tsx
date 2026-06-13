import type {ReactNode} from 'react';
import ProjectLanding from '@site/src/components/ProjectLanding';
import {getProject} from '@site/src/data/projects';

export default function TromsoPage(): ReactNode {
  return <ProjectLanding project={getProject('tromso')!} />;
}
