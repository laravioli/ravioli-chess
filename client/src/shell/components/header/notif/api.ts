import { useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  clearNotifMutation,
  listNotifOptions,
  listNotifQueryKey,
} from '@/lib/api/@tanstack/react-query.gen';
import { wsSend } from '@/lib/socket';
import { type PageNotification } from '@/lib/api';

export type NotificationData = Omit<PageNotification, 'unread'> | undefined;

type onNewNotif = () => boolean;

export const useNotificationCount = (cb: onNewNotif) => {
  const client = useQueryClient();

  const notified = useCallback(() => {
    client.setQueryData<PageNotification>(pageKey(1), (old) => (old ? { ...old, unread: 0 } : old));
    wsSend('notified');
  }, []);

  const { data: unreadCount } = useQuery({
    ...listNotifOptions({ query: { page: 1 } }),
    select: (data) => data?.unread,
  });

  useEffect(() => {
    if (unreadCount ?? 0 > 0) {
      cb() && notified();
    }
  }, [unreadCount, cb]);

  return unreadCount ?? 0;
};

export const useNotificationData = (page: number) => {
  const { data, refetch } = useQuery({
    ...listNotifOptions({ query: { page: page } }),
    placeholderData: (old) => old,
    select: (data) => {
      const { unread, ...rest } = data;
      return rest;
    },
  });
  return { notifications: data, refetch } as {
    notifications: NotificationData;
    refetch: typeof refetch;
  };
};

export const useNotificationAction = () => {
  const client = useQueryClient();

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
          return key?._id === 'listNotif' && key?.query?.page !== 1;
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
    },
  });

  return { invalidate, clear: () => mutation.mutate({}) };
};

const pageKey = (page: number) => listNotifQueryKey({ query: { page } });
