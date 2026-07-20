import { useRegisterModel } from './register.model';
import { RegisterView } from './register.view';

const Register = () => {
  const model = useRegisterModel();
  return <RegisterView {...model} />;
};

export default Register;
