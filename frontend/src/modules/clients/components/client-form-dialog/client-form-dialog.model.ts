import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { Client } from '@/common/types/client.type';
import { getErrorMessage } from '@/common/utils/error-handler';
import { clientSchema, type ClientFormData } from '@/modules/clients/schemas/client.schema';
import { clientService } from '../../services/client.service';

interface ClientFormDialogProps {
  client?: Client;
}

export const useClientFormDialogModel = ({ client }: ClientFormDialogProps) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { t } = useTranslation('clients');
  const isEditing = !!client;

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: client?.name ?? '', document: client?.document ?? '' },
  });

  const mutation = useMutation({
    mutationKey: ['clients', isEditing ? 'update' : 'create'],
    mutationFn: (data: ClientFormData) =>
      isEditing ? clientService.update(client.id, data) : clientService.create(data),
    onSuccess: () => {
      toast.success(isEditing ? t('toasts.updated') : t('toasts.created'));
      void queryClient.invalidateQueries({ queryKey: ['clients'] });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const onSubmit = form.handleSubmit((data) => mutation.mutate(data));

  return { open, setOpen, form, onSubmit, isEditing, isSubmitting: mutation.isPending };
};

export type ClientFormDialogModel = ReturnType<typeof useClientFormDialogModel>;
