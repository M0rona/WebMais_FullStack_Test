import { Loader2 } from 'lucide-react';
import { Button as ShadcnButton } from '@/common/components/shadcn/button';
import type { ButtonModel } from './button.model';

export const ButtonView = ({ loading, disabled, children, rest }: ButtonModel) => {
  return (
    <ShadcnButton disabled={disabled} {...rest}>
      {loading && <Loader2 className="animate-spin" />}
      {children}
    </ShadcnButton>
  );
};
