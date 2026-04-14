import { QueryClient } from '@tanstack/react-query';
import { listNotifQueryKey } from '@/lib/api/@tanstack/react-query.gen';
import { ListNotifResponse } from '@/lib/api';

export const globalHandlers = (queryClient: QueryClient) => {
  const notifications = (d: ListNotifResponse) => queryClient.setQueryData(listNotifQueryKey(), d);
  const handlers = { notifications };
  return (t: string, d: any) => handlers[t](d);
};
