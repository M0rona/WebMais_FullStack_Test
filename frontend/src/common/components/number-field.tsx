import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface NumberFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  id?: string;
}

// Aceita vírgula OU ponto como separador decimal (comum digitar "1500,50" em
// pt-BR). Enquanto o texto digitado ainda não forma um número completo (ex.:
// termina em "," ou "."), mantém o valor bruto no form em vez de converter,
// pra não travar o usuário no meio da digitação.
const parseDecimalInput = (raw: string): number | string => {
  if (raw.trim() === '') return raw;

  const normalized = raw.replace(',', '.');
  const isIncomplete = /[.,]$/.test(raw);
  const parsed = Number(normalized);

  if (isIncomplete || Number.isNaN(parsed)) {
    return raw;
  }

  return parsed;
};

export const NumberField = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  required,
  error,
  placeholder,
  id,
}: NumberFieldProps<TFieldValues>) => {
  const inputId = id ?? name;

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className={cn(error && 'text-destructive')}>
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Input
            id={inputId}
            name={field.name}
            ref={field.ref}
            type="text"
            inputMode="decimal"
            placeholder={placeholder}
            className={cn(error && 'border-destructive focus-visible:ring-destructive')}
            value={field.value ?? ''}
            onBlur={field.onBlur}
            onChange={(event) => field.onChange(parseDecimalInput(event.target.value))}
          />
        )}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};
