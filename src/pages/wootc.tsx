import type {ReactNode} from 'react';
import ProjectLanding from '@site/src/components/ProjectLanding';
import WootcGetStarted from '@site/src/components/WootcGetStarted';
import {getProject} from '@site/src/data/projects';

export default function WootcPage(): ReactNode {
  return (
    <ProjectLanding project={getProject('wootc')!}>
      <WootcGetStarted />
    </ProjectLanding>
  );
}
