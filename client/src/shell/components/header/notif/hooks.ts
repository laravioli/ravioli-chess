import { useRef, useState, useCallback, useEffect } from 'react';
import { useQueryClient, useQuery, QueryObserver, useMutation } from '@tanstack/react-query';
import type { PageNotification } from '@/lib/api';
import { wsSend } from '@/lib/socket';
import {
  listNotifQueryKey,
  listNotifOptions,
  clearNotifMutation,
} from '@/lib/api/@tanstack/react-query.gen';

const pageKey = (page: number) => listNotifQueryKey({ query: { page } });

export interface Notifs {
  data: PageNotification | undefined;
  page: number;
  invalidate: (page: number) => Promise<void>;
  clear: () => void;
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
  const client = useQueryClient();

  const observer = useRef<QueryObserver<any, Error, any, any, any> | null>(null);

  const { data } = useQuery({
    ...listNotifOptions({ query: { page: page } }),
    staleTime: 1000,
    enabled: hovered,
    placeholderData: (old) => old,
  });

  const invalidate = useCallback(
    (page: number) => client.invalidateQueries({ queryKey: pageKey(page) }),
    [],
  );

  const mutation = useMutation({
    ...clearNotifMutation(),
    onSettled: () => {
      client.removeQueries({
        predicate: (query) => {
          const key = query.queryKey[0] as ReturnType<typeof listNotifQueryKey>[0];
          const isNotificationList = key?._id === 'listNotif';
          const isNotFirstPage = key?.query?.page !== 1;
          return isNotificationList && isNotFirstPage;
        },
      });
      client.setQueryData(pageKey(1), {
        items: [],
        total: 0,
        page: 1,
        size: 4,
        pages: 0,
        unread: 0,
      });
      setPage(1);
    },
  });

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

  return {
    data,
    page,
    invalidate,
    clear: () => mutation.mutate({}),
    setPage,
    maxPage: data?.pages,
  };
};
