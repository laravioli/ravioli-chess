import { useState, useCallback, useEffect } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import type { PageNotification } from '@/lib/api';
import { wsSend } from '@/lib/socket';
import { listNotifQueryKey, listNotifOptions } from '@/lib/api/@tanstack/react-query.gen';

export const useNotification = ({
  dropdownOpened,
  hovered,
}: {
  dropdownOpened: boolean;
  hovered: boolean;
}) => {
  const [page, setPage] = useState(1);

  const client = useQueryClient();
  const { data } = useQuery({
    ...listNotifOptions({ query: { page: page } }),
    staleTime: Infinity,
    enabled: hovered,
    placeholderData: (old) => old,
  });

  const invalidate = useCallback((page: number) => {
    client.invalidateQueries({ queryKey: listNotifQueryKey({ query: { page } }) });
  }, []);

  const notified = useCallback(() => {
    wsSend('notified');
    client.setQueryData<PageNotification>(listNotifQueryKey({ query: { page: 1 } }), (old) =>
      old ? { ...old, unread: 0 } : old,
    );
  }, []);

  useEffect(() => {
    if (dropdownOpened && page == 1 && data?.unread! > 0) notified();
  }, [dropdownOpened, page, data!?.unread]);

  return { data, page, invalidate, setPage };
};
