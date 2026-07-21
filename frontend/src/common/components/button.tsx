import type { ComponentProps } from 'react';
import { Loader2 } from 'lucide-react';
import { Button as ShadcnButton } from '@/common/components/shadcn/button';

export interface ButtonProps extends ComponentProps<typeof ShadcnButton> {
  loading?: boolean;
}

export const Button = ({ loading, disabled, children, ...props }: ButtonProps) => {
  return (
    <ShadcnButton disabled={loading || disabled} {...props}>
      {loading && <Loader2 className="animate-spin" />}
      {children}
    </ShadcnButton>
  );
};
