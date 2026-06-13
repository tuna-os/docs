import ProjectLanding from '@site/src/components/ProjectLanding';
import {PROJECTS} from '@site/src/data/projects';

const project = PROJECTS.find((p) => p.id === 'dakota')!;

export default function Dakota(): JSX.Element {
  return <ProjectLanding project={project} />;
}
