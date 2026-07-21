import { useInputFieldModel, type InputFieldProps } from './input-field.model';
import { InputFieldView } from './input-field.view';

const InputField = (props: InputFieldProps) => {
  const model = useInputFieldModel(props);
  return <InputFieldView {...model} />;
};

export default InputField;
export type { InputFieldProps } from './input-field.model';
