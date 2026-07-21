import { Input } from '@/common/components/shadcn/input';
import { Label } from '@/common/components/shadcn/label';
import { cn } from '@/lib/utils';
import type { InputFieldModel } from './input-field.model';

export const InputFieldView = ({
  label,
  required,
  error,
  inputId,
  name,
  className,
  rest,
}: InputFieldModel) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className={cn(error && 'text-destructive')}>
        <span>
          {label}
          {required && <span className="text-destructive"> *</span>}
        </span>
      </Label>
      <Input
        id={inputId}
        name={name}
        className={cn(error && 'border-destructive focus-visible:ring-destructive', className)}
        {...rest}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};
