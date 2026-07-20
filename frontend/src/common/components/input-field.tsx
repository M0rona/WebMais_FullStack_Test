import type { ComponentProps } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface InputFieldProps extends ComponentProps<typeof Input> {
  label: string;
  required?: boolean;
  error?: string;
}

export const InputField = ({
  label,
  required,
  error,
  id,
  name,
  className,
  ...props
}: InputFieldProps) => {
  const inputId = id ?? name;

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className={cn(error && 'text-destructive')}>
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={inputId}
        name={name}
        className={cn(error && 'border-destructive focus-visible:ring-destructive', className)}
        {...props}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};
