import type { ComponentProps } from 'react';
import { Input } from '@/common/components/shadcn/input';

export interface InputFieldProps extends ComponentProps<typeof Input> {
  label: string;
  required?: boolean;
  error?: string;
}

export const useInputFieldModel = ({
  label,
  required,
  error,
  id,
  name,
  className,
  ...rest
}: InputFieldProps) => {
  const inputId = id ?? name;

  return { label, required, error, inputId, name, className, rest };
};

export type InputFieldModel = ReturnType<typeof useInputFieldModel>;
