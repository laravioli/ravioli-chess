import { type Data } from './interface';
import { chessPositionsQueryKey, listNotifQueryKey } from '@/lib/api/@tanstack/react-query.gen';
import { type QueryClient } from '@tanstack/react-query';
import { defined } from '@/lib/common';

export function hydrate(data: Data, client: QueryClient) {
  const unReadCount = data.unreadCount;
  if (defined(unReadCount)) {
    const notifKey = listNotifQueryKey({ query: { page: 1 } });
    client.setQueryData(notifKey, {
      items: [],
      total: 0,
      page: 1,
      size: 0,
      pages: 1,
      unread: unReadCount,
    });
  }
  const chessPositions = data.positions;
  if (defined(chessPositions)) {
    const chessPositionsKey = chessPositionsQueryKey();
    client.setQueryData(chessPositionsKey, chessPositions);
  }
}
