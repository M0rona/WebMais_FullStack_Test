import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { getErrorMessage } from '@/common/utils/error-handler';
import { clientService } from '../../services/client.service';

interface ClientDeleteDialogProps {
  clientId: string;
}

export const useClientDeleteDialogModel = ({ clientId }: ClientDeleteDialogProps) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('clients');

  const mutation = useMutation({
    mutationKey: ['clients', 'delete'],
    mutationFn: () => clientService.delete(clientId),
    onSuccess: () => {
      toast.success(t('toasts.deleted'));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  return { onConfirm: () => mutation.mutate() };
};

export type ClientDeleteDialogModel = ReturnType<typeof useClientDeleteDialogModel>;
