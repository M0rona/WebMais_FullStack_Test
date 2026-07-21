import { Controller, type FieldValues } from 'react-hook-form';
import { Input } from '@/common/components/shadcn/input';
import { Label } from '@/common/components/shadcn/label';
import { cn } from '@/lib/utils';
import { parseDecimalInput, type NumberFieldModel } from './number-field.model';

export const NumberFieldView = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  required,
  error,
  inputId,
  className,
  rest,
}: NumberFieldModel<TFieldValues>) => {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={inputId} className={cn(error && 'text-destructive')}>
        <span>
          {label}
          {required && <span className="text-destructive"> *</span>}
        </span>
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
            className={cn(error && 'border-destructive focus-visible:ring-destructive')}
            value={field.value ?? ''}
            onBlur={field.onBlur}
            onChange={(event) => field.onChange(parseDecimalInput(event.target.value))}
            {...rest}
          />
        )}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};
