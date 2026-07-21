import { useButtonModel, type ButtonProps } from './button.model';
import { ButtonView } from './button.view';

const Button = (props: ButtonProps) => {
  const model = useButtonModel(props);
  return <ButtonView {...model} />;
};

export default Button;
export type { ButtonProps } from './button.model';
