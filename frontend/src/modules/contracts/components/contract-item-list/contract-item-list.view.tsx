import { Trash2 } from 'lucide-react';
import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@/common/components/button';
import { InputField } from '@/common/components/input-field';
import { NumberField } from '@/common/components/number-field';
import { translateError } from '@/common/utils/translate-error';
import { Label } from '@/common/components/shadcn/label';
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
  const { t } = useTranslation('contracts');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{t('items.title')}</Label>
        <Button type="button" variant="outline" size="sm" onClick={onAddItem}>
          {t('items.add')}
        </Button>
      </div>

      {errors?.root && (
        <p className="text-sm text-destructive">{translateError(t, errors.root.message)}</p>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => {
          const quantity = Number(watchedItems[index]?.quantity) || 0;
          const unitValue = Number(watchedItems[index]?.unitValue) || 0;
          const subtotal = quantity * unitValue;

          return (
            <div key={field.id} className="space-y-3 rounded-md border p-3">
              <InputField
                label={t('items.description')}
                required
                placeholder={t('items.descriptionPlaceholder')}
                error={translateError(t, errors?.[index]?.description?.message)}
                {...register(`items.${index}.description`)}
              />

              <div className="flex gap-2">
                <NumberField
                  control={control}
                  name={`items.${index}.quantity`}
                  label={t('items.quantity')}
                  required
                  placeholder="0"
                  error={translateError(t, errors?.[index]?.quantity?.message)}
                  className="flex-1"
                />
                <NumberField
                  control={control}
                  name={`items.${index}.unitValue`}
                  label={t('items.unitValue')}
                  required
                  placeholder="0,00"
                  error={translateError(t, errors?.[index]?.unitValue?.message)}
                  className="flex-1"
                />
              </div>

              <div className="flex justify-between gap-2">
                <div className="space-y-2">
                  <Label>{t('items.total')}</Label>
                  <div className="flex h-8 items-center text-sm text-muted-foreground">
                    {formatCurrency(subtotal)}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="invisible">{t('items.actions')}</Label>
                  <Button
                    type="button"
                    variant="destructive"
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

      <div className="flex justify-end text-sm font-medium">
        {t('items.totalLabel', { value: formatCurrency(total) })}
      </div>
    </div>
  );
};
