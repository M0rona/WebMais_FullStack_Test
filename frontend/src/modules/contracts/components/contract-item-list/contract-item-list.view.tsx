import { Trash2 } from 'lucide-react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/common/utils/formatters';
import type { ContractFormData } from '@/modules/contracts/schemas/contract.schema';
import type { ContractItemListModel } from './contract-item-list.model';

type ContractItemListViewProps = ContractItemListModel & {
  register: UseFormRegister<ContractFormData>;
  errors?: FieldErrors<ContractFormData>['items'];
};

export const ContractItemListView = ({
  fields,
  watchedItems,
  total,
  onAddItem,
  onRemoveItem,
  register,
  errors,
}: ContractItemListViewProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Itens do contrato</Label>
        <Button type="button" variant="outline" size="sm" onClick={onAddItem}>
          Adicionar item
        </Button>
      </div>

      {errors?.root && <p className="text-sm text-destructive">{errors.root.message}</p>}

      <div className="space-y-3">
        {fields.map((field, index) => {
          const quantity = Number(watchedItems[index]?.quantity) || 0;
          const unitValue = Number(watchedItems[index]?.unitValue) || 0;
          const subtotal = quantity * unitValue;

          return (
            <div key={field.id} className="grid grid-cols-12 items-start gap-2 rounded-md border p-3">
              <div className="col-span-5 space-y-1">
                <Input placeholder="Descrição" {...register(`items.${index}.description`)} />
                {errors?.[index]?.description && (
                  <p className="text-xs text-destructive">{errors[index]?.description?.message}</p>
                )}
              </div>
              <div className="col-span-2 space-y-1">
                <Input
                  type="number"
                  step="1"
                  placeholder="Qtd."
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Valor unit."
                  {...register(`items.${index}.unitValue`, { valueAsNumber: true })}
                />
              </div>
              <div className="col-span-2 flex h-9 items-center text-sm text-muted-foreground">
                {formatCurrency(subtotal)}
              </div>
              <div className="col-span-1 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveItem(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end text-sm font-medium">Total: {formatCurrency(total)}</div>
    </div>
  );
};
