import { UserSuccess } from '@/lib/api';
import { chessPositionsQueryKey, listNotifQueryKey } from '@/lib/api/@tanstack/react-query.gen';
import { defined } from '@/lib/common';
import { QueryClient } from '@tanstack/react-query';
import type { ServerPayload, UserCacheEvent } from './interface';

export function hydrate(payload: ServerPayload, client: QueryClient): UserCacheEvent {
  const setUnreadCount = (unreadCount: number) => {
    const notifKey = listNotifQueryKey({ query: { page: 1 } });
    client.setQueryData(notifKey, {
      items: [],
      total: 0,
      page: 1,
      size: 4,
      pages: 0,
      unread: unreadCount,
    });
  };

  if (payload) {
    if (defined(payload.user.unread_count)) setUnreadCount(payload.user.unread_count);
    const chessPositions = payload.data?.positions;
    if (defined(chessPositions)) {
      const chessPositionsKey = chessPositionsQueryKey();
      client.setQueryData(chessPositionsKey, chessPositions);
    }
  }

  return {
    onLogin: (user: UserSuccess) => Promise.resolve(setUnreadCount(user.unreadCount)),
    onLogout: () => setTimeout(() => client.resetQueries(), 100),
  };
}
