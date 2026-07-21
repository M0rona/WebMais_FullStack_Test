import type { FieldValues } from 'react-hook-form';
import { useNumberFieldModel, type NumberFieldProps } from './number-field.model';
import { NumberFieldView } from './number-field.view';

const NumberField = <TFieldValues extends FieldValues>(props: NumberFieldProps<TFieldValues>) => {
  const model = useNumberFieldModel(props);
  return <NumberFieldView {...model} />;
};

export default NumberField;
export type { NumberFieldProps } from './number-field.model';
