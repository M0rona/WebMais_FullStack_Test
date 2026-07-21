import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useDebouncedValue } from '@/common/hooks/use-debounced-value';
import { clientService } from '@/modules/clients/services/client.service';

const PAGE_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 300;

interface ClientPickerDialogProps {
  value?: string;
  onChange: (clientId: string) => void;
}

export const useClientPickerDialogModel = ({ value, onChange }: ClientPickerDialogProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['clients', 'picker', { search: debouncedSearch }],
    queryFn: ({ pageParam }) =>
      clientService.findAll({
        page: pageParam,
        limit: PAGE_LIMIT,
        search: debouncedSearch.trim() || undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: open,
  });

  const { data: selectedClient } = useQuery({
    queryKey: ['clients', value],
    queryFn: () => clientService.findOne(value as string),
    enabled: !!value,
  });

  const clients = data?.pages.flatMap((page) => page.data) ?? [];

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setSearch('');
  };

  const onSelect = (clientId: string) => {
    onChange(clientId);
    onOpenChange(false);
  };

  const onLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  return {
    open,
    onOpenChange,
    search,
    setSearch,
    clients,
    isLoading,
    isFetchingNextPage,
    onLoadMore,
    selectedClient,
    onSelect,
  };
};

export type ClientPickerDialogModel = ReturnType<typeof useClientPickerDialogModel>;
