import { useRef, useState, useCallback, useEffect } from 'react';
import { useQueryClient, useQuery, QueryObserver } from '@tanstack/react-query';
import type { PageNotification } from '@/lib/api';
import { wsSend } from '@/lib/socket';
import { listNotifQueryKey, listNotifOptions } from '@/lib/api/@tanstack/react-query.gen';

const pageKey = (page: number) => listNotifQueryKey({ query: { page } });

export interface Notifs {
  data: PageNotification | undefined;
  page: number;
  invalidate: (page: number) => Promise<void>;
  setPage: (page: number) => void;
  maxPage: number | undefined;
}

export const useNotification = ({
  dropdownOpened,
  hovered,
}: {
  dropdownOpened: boolean;
  hovered: boolean;
}): Notifs => {
  const [page, setPage] = useState(1);

  const observer = useRef<QueryObserver<any, Error, any, any, any> | null>(null);

  const client = useQueryClient();
  const { data } = useQuery({
    ...listNotifOptions({ query: { page: page } }),
    staleTime: 0,
    enabled: hovered,
    placeholderData: (old) => old,
  });

  const invalidate = useCallback(
    (page: number) => client.invalidateQueries({ queryKey: pageKey(page) }),
    [],
  );

  const notified = useCallback(() => {
    wsSend('notified');
    client.setQueryData<PageNotification>(pageKey(1), (old) => (old ? { ...old, unread: 0 } : old));
  }, []);

  useEffect(() => {
    if (observer.current === null)
      observer.current = new QueryObserver(client, { queryKey: pageKey(1), enabled: false });
    const unsubscribe = observer.current.subscribe(() => {
      setPage(1);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (dropdownOpened) {
      page === 1 && data && data.unread > 0 && notified();
    }
  }, [dropdownOpened, page, data]);

  return { data, page, invalidate, setPage, maxPage: data?.pages };
};
