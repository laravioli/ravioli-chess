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

const invalidateUserData = (queryClient: QueryClient, username: string) =>
  queryClient.invalidateQueries({ queryKey: getUserQueryKey({ path: { username } }) });

export const useAddFriend = ({ username }: SocialHookParams) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...sendFriendRequestMutation(),
    onSuccess: (friendship) => refreshUserData(queryClient, username, friendship),
    onError: () => invalidateUserData(queryClient, username),
  });

  return mutation;
};

export const useCancelRequest = ({ username }: SocialHookParams) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...cancelFriendRequestMutation(),
    onSuccess: () => refreshUserData(queryClient, username, undefined),
    onError: () => invalidateUserData(queryClient, username),
  });

  return mutation;
};

export const useAcceptRequest = ({ username }: SocialHookParams) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...acceptFriendRequestMutation(),
    onSuccess: async (friendship) => {
      refreshUserData(queryClient, username, friendship);
      await queryClient.invalidateQueries({ queryKey: listMyFriendsQueryKey() });
    },
    onError: () => invalidateUserData(queryClient, username),
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
    onError: () => invalidateUserData(queryClient, username),
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
    onError: () => invalidateUserData(queryClient, username),
  });

  return mutation;
};
