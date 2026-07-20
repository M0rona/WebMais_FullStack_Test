import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/common/utils/error-handler';
import { clientService } from '../../services/client.service';

export const useClientListModel = () => {
  const queryClient = useQueryClient();

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: clientService.findAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientService.delete(id),
    onSuccess: () => {
      toast.success('Cliente excluído');
      void queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  return {
    clients: clients ?? [],
    isLoading,
    onDelete: (id: string) => deleteMutation.mutate(id),
  };
};

export type ClientListModel = ReturnType<typeof useClientListModel>;
