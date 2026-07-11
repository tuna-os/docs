import type {ReactNode} from 'react';
import VariantLanding from '@site/src/components/VariantLanding';
import {getVariant} from '@site/src/data/variants';

export default function SailfinPage(): ReactNode {
  return <VariantLanding variant={getVariant('sailfin')!} />;
}
