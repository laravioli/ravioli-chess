import { QueryClient } from '@tanstack/react-query';
import { listNotifQueryKey } from '@/lib/api/@tanstack/react-query.gen';
import { ListNotifResponse } from '@/lib/api';

export const socketHandlers = (queryClient: QueryClient) => {
  const notifications = (d: ListNotifResponse) => {
    const key = listNotifQueryKey({ query: { page: 1 } });

    queryClient.setQueryData(key, d);
  };
  const handlers = { notifications };
  return (t: string, d: any) => handlers[t](d);
};
