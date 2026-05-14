import { QueryClient } from '@tanstack/react-query';
import { defined } from '@/lib/common';
import { chessPositionsQueryKey, listNotifQueryKey } from '@/lib/api/@tanstack/react-query.gen';
import { UserSuccess } from '@/lib/api';
import type { Data, UserCacheEvent } from './interface';

export function hydrate(data: Data | undefined, client: QueryClient): UserCacheEvent {
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

  if (data) {
    if (defined(data.unreadCount)) setUnreadCount(data.unreadCount);
    const chessPositions = data.positions;
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
