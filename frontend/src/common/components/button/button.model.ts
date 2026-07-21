import type { ComponentProps, ReactNode } from 'react';
import type { Button as ShadcnButton } from '@/common/components/shadcn/button';

export interface ButtonProps extends ComponentProps<typeof ShadcnButton> {
  loading?: boolean;
}

export const useButtonModel = ({ loading, disabled, children, ...rest }: ButtonProps) => {
  return {
    loading,
    disabled: Boolean(loading || disabled),
    children: children as ReactNode,
    rest,
  };
};

export type ButtonModel = ReturnType<typeof useButtonModel>;
