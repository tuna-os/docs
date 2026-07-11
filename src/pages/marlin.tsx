import type {ReactNode} from 'react';
import VariantLanding from '@site/src/components/VariantLanding';
import {getVariant} from '@site/src/data/variants';

export default function MarlinPage(): ReactNode {
  return <VariantLanding variant={getVariant('marlin')!} />;
}
