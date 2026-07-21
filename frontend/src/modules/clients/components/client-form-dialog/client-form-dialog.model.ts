import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { Client } from '@/common/types/client.type';
import { formatDocument } from '@/common/utils/formatters';
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
    defaultValues: {
      name: client?.name ?? '',
      document: client ? formatDocument(client.document) : '',
    },
  });

  const onDocumentChange = (event: ChangeEvent<HTMLInputElement>) => {
    form.setValue('document', formatDocument(event.target.value), { shouldValidate: true });
  };

  const mutation = useMutation({
    mutationKey: ['clients', isEditing ? 'update' : 'create'],
    mutationFn: (data: ClientFormData) => {
      const payload = { ...data, document: data.document.replace(/\D/g, '') };
      return isEditing ? clientService.update(client.id, payload) : clientService.create(payload);
    },
    onSuccess: () => {
      toast.success(isEditing ? t('toasts.updated') : t('toasts.created'));
      void queryClient.invalidateQueries({ queryKey: ['clients'] });
      setOpen(false);
      form.reset();
    },
  });

  const onSubmit = form.handleSubmit((data) => mutation.mutate(data));

  return {
    open,
    setOpen,
    form,
    onSubmit,
    onDocumentChange,
    isEditing,
    isSubmitting: mutation.isPending,
  };
};

export type ClientFormDialogModel = ReturnType<typeof useClientFormDialogModel>;
