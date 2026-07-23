import type {ReactNode} from 'react';
import ProjectLanding from '@site/src/components/ProjectLanding';
import {getProject} from '@site/src/data/projects';

export default function MandelbrotPage(): ReactNode {
  return <ProjectLanding project={getProject('mandelbrot')!} />;
}
