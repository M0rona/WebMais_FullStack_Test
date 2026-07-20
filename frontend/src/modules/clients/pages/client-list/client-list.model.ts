import { useQuery } from '@tanstack/react-query';
import { clientService } from '../../services/client.service';

export const useClientListModel = () => {
  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: clientService.findAll,
  });

  return {
    clients: clients ?? [],
    isLoading,
  };
};

export type ClientListModel = ReturnType<typeof useClientListModel>;
