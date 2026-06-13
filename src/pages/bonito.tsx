import type {ReactNode} from 'react';
import VariantLanding from '@site/src/components/VariantLanding';
import {getVariant} from '@site/src/data/variants';

export default function BonitoPage(): ReactNode {
  return <VariantLanding variant={getVariant('bonito')!} />;
}
