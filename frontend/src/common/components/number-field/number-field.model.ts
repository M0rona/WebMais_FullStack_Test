import type { ComponentProps } from 'react';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { Input } from '@/common/components/shadcn/input';

type ManagedInputProps = 'value' | 'onChange' | 'onBlur' | 'name' | 'ref' | 'type' | 'inputMode';

export interface NumberFieldProps<TFieldValues extends FieldValues>
  extends Omit<ComponentProps<typeof Input>, ManagedInputProps> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  required?: boolean;
  error?: string;
}

// Aceita vírgula OU ponto como separador decimal (comum digitar "1500,50" em
// pt-BR). Enquanto o texto digitado ainda não forma um número completo (ex.:
// termina em "," ou "."), mantém o valor bruto no form em vez de converter,
// pra não travar o usuário no meio da digitação.
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
