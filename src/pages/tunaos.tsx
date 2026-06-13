import type {ReactNode} from 'react';
import ProjectLanding from '@site/src/components/ProjectLanding';
import {getProject} from '@site/src/data/projects';

export default function TunaosProjectPage(): ReactNode {
  return <ProjectLanding project={getProject('tunaos')!} />;
}
