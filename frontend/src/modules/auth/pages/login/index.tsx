import { useLoginModel } from './login.model';
import { LoginView } from './login.view';

const Login = () => {
  const model = useLoginModel();
  return <LoginView {...model} />;
};

export default Login;
