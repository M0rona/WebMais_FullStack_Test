import { Trash2 } from 'lucide-react';
import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import { Button } from '@/common/components/button';
import { InputField } from '@/common/components/input-field';
import { NumberField } from '@/common/components/number-field';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/common/utils/formatters';
import type { ContractFormData } from '@/modules/contracts/schemas/contract.schema';
import type { ContractItemListModel } from './contract-item-list.model';

type ContractItemListViewProps = ContractItemListModel & {
  control: Control<ContractFormData>;
  register: UseFormRegister<ContractFormData>;
  errors?: FieldErrors<ContractFormData>['items'];
};

export const ContractItemListView = ({
  fields,
  watchedItems,
  total,
  onAddItem,
  onRemoveItem,
  control,
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
            <div key={field.id} className="space-y-3 rounded-md border p-3">
              <InputField
                label="Descrição"
                required
                placeholder="Descrição do item"
                error={errors?.[index]?.description?.message}
                {...register(`items.${index}.description`)}
              />

              <div className="grid grid-cols-4 gap-2">
                <NumberField
                  control={control}
                  name={`items.${index}.quantity`}
                  label="Quantidade"
                  required
                  placeholder="0"
                  error={errors?.[index]?.quantity?.message}
                />
                <NumberField
                  control={control}
                  name={`items.${index}.unitValue`}
                  label="Valor unitário"
                  required
                  placeholder="0,00"
                  error={errors?.[index]?.unitValue?.message}
                />
                <div className="space-y-2">
                  <Label>Total</Label>
                  <div className="flex h-8 items-center text-sm text-muted-foreground">
                    {formatCurrency(subtotal)}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="invisible">Ações</Label>
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
            </div>
          );
        })}
      </div>

      <div className="flex justify-end text-sm font-medium">Total: {formatCurrency(total)}</div>
    </div>
  );
};
