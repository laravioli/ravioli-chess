import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  sendFriendRequestMutation,
  acceptFriendRequestMutation,
  cancelFriendRequestMutation,
  rejectFriendRequestMutation,
  removeFriendMutation,
  getUserQueryKey,
  listMyFriendsQueryKey,
} from '@/lib/api/@tanstack/react-query.gen';

import type { GetUserResponse, FriendShip } from '@/lib/api';

interface UrlPath {
  path: { target_id: string };
}

interface SocialHookParams {
  username: string;
}

export const makeSocialUrl = (id: string): UrlPath => ({ path: { target_id: id } });

const refreshUserData = (queryClient: QueryClient, username: string, friendship?: FriendShip) => {
  queryClient.setQueryData<GetUserResponse>(getUserQueryKey({ path: { username } }), (old) =>
    old ? { ...old, friendship } : old,
  );
};

export const useAddFriend = ({ username }: SocialHookParams) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...sendFriendRequestMutation(),
    onSuccess: (friendship) => refreshUserData(queryClient, username, friendship),
  });

  return mutation;
};

export const useCancelRequest = ({ username }: SocialHookParams) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...cancelFriendRequestMutation(),
    onSuccess: () => refreshUserData(queryClient, username, undefined),
  });

  return mutation;
};

export const useAcceptRequest = ({ username }: SocialHookParams) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...acceptFriendRequestMutation(),
    onSuccess: async (friendhsip) => {
      refreshUserData(queryClient, username, friendhsip);
      await queryClient.invalidateQueries({ queryKey: listMyFriendsQueryKey() });
    },
  });

  return mutation;
};

export const useRejectRequest = ({ username }: SocialHookParams) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...rejectFriendRequestMutation(),
    onSuccess: () => {
      refreshUserData(queryClient, username, undefined);
    },
  });

  return mutation;
};

export const useRemoveFriend = ({ username }: SocialHookParams) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...removeFriendMutation(),
    onSuccess: async () => {
      refreshUserData(queryClient, username, undefined);
      await queryClient.invalidateQueries({ queryKey: listMyFriendsQueryKey() });
    },
  });

  return mutation;
};
