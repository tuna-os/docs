import {useEffect} from 'react';
import {useHistory} from '@docusaurus/router';

export default function Copr(): null {
  const history = useHistory();
  useEffect(() => { history.replace('/docs/copr'); }, []);
  return null;
}
