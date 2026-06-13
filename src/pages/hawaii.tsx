import ProjectLanding from '@site/src/components/ProjectLanding';
import {PROJECTS} from '@site/src/data/projects';

const project = PROJECTS.find((p) => p.id === 'hawaii')!;

export default function Hawaii(): JSX.Element {
  return <ProjectLanding project={project} />;
}
