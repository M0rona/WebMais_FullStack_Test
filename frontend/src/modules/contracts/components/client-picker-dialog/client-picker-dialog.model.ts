import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { clientService } from '@/modules/clients/services/client.service';

interface ClientPickerDialogProps {
  value?: string;
  onChange: (clientId: string) => void;
}

export const useClientPickerDialogModel = ({ value, onChange }: ClientPickerDialogProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientService.findAll(),
    enabled: open,
  });

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(term) || client.document.toLowerCase().includes(term),
    );
  }, [clients, search]);

  const selectedClient = clients.find((client) => client.id === value);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setSearch('');
  };

  const onSelect = (clientId: string) => {
    onChange(clientId);
    onOpenChange(false);
  };

  return {
    open,
    onOpenChange,
    search,
    setSearch,
    filteredClients,
    isLoading,
    selectedClient,
    onSelect,
  };
};

export type ClientPickerDialogModel = ReturnType<typeof useClientPickerDialogModel>;
