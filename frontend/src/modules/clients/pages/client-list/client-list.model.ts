import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { clientService } from '../../services/client.service';

const PAGE_LIMIT = 10;

export const useClientListModel = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['clients', { search, page }],
    queryFn: () =>
      clientService.findAll({ search: search.trim() || undefined, page, limit: PAGE_LIMIT }),
  });

  const onSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return {
    clients: data?.data ?? [],
    isLoading,
    search,
    page,
    totalPages: data?.totalPages ?? 1,
    onSearchChange,
    onPageChange: setPage,
  };
};

export type ClientListModel = ReturnType<typeof useClientListModel>;
