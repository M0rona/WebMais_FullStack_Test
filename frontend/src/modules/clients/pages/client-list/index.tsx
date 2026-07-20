import { useClientListModel } from './client-list.model';
import { ClientListView } from './client-list.view';

const ClientList = () => {
  const model = useClientListModel();
  return <ClientListView {...model} />;
};

export default ClientList;
