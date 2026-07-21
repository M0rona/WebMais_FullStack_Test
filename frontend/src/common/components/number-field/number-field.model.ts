import type { ComponentProps } from 'react';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { Input } from '@/common/components/shadcn/input';

type ManagedInputProps = 'value' | 'onChange' | 'onBlur' | 'name' | 'ref' | 'type' | 'inputMode';

export interface NumberFieldProps<TFieldValues extends FieldValues> extends Omit<
  ComponentProps<typeof Input>,
  ManagedInputProps
> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  required?: boolean;
  error?: string;
}

export const parseDecimalInput = (raw: string): number | string => {
  if (raw.trim() === '') return raw;

  const normalized = raw.replace(',', '.');
  const isIncomplete = /[.,]$/.test(raw);
  const parsed = Number(normalized);

  if (isIncomplete || Number.isNaN(parsed)) {
    return raw;
  }

  return parsed;
};

export const useNumberFieldModel = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  required,
  error,
  id,
  className,
  ...rest
}: NumberFieldProps<TFieldValues>) => {
  const inputId = id ?? name;

  return { control, name, label, required, error, inputId, className, rest };
};

export type NumberFieldModel<TFieldValues extends FieldValues = FieldValues> = ReturnType<
  typeof useNumberFieldModel<TFieldValues>
>;
