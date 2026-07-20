import { useHeaderModel } from './header.model';
import { HeaderView } from './header.view';

const Header = () => {
  const model = useHeaderModel();
  return <HeaderView {...model} />;
};

export default Header;
