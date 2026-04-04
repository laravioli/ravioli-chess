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

import { type GetUserResponse, type FriendShip } from '@/lib/api';

interface UrlPath {
  path: { target_id: string };
}

interface SocialHookParams {
  username: string;
  id: string;
}

const makeUrl = (id: string): UrlPath => ({ path: { target_id: id } });

const refreshUserData = (
  queryClient: QueryClient,
  username: string,
  friendship: FriendShip | undefined,
) => {
  const userDataKey = getUserQueryKey({ path: { username: username } });
  queryClient.setQueryData(userDataKey, (oldData: GetUserResponse) =>
    oldData ? { ...oldData, friendship: friendship } : oldData,
  );
};

export const useAddFriend = ({ username, id }: SocialHookParams) => {
  const urlPath = makeUrl(id);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...sendFriendRequestMutation(urlPath),
    onSuccess: (friendship) => refreshUserData(queryClient, username, friendship),
  });

  return { status: mutation.status, onClick: () => mutation.mutate(urlPath) };
};

export const useAcceptRequest = ({ username, id }: SocialHookParams) => {
  const urlPath = makeUrl(id);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...acceptFriendRequestMutation(urlPath),
    onSuccess: async (friendhsip) => {
      refreshUserData(queryClient, username, friendhsip);
      await Promise.all([queryClient.invalidateQueries({ queryKey: listMyFriendsQueryKey() })]);
    },
  });

  return { status: mutation.status, onClick: () => mutation.mutate(urlPath) };
};

export const useCancelRequest = ({ username, id }: SocialHookParams) => {
  const urlPath = makeUrl(id);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...cancelFriendRequestMutation(urlPath),
    onSuccess: () => refreshUserData(queryClient, username, undefined),
  });

  return { status: mutation.status, onClick: () => mutation.mutate(urlPath) };
};

export const useRejectRequest = ({ username, id }: SocialHookParams) => {
  const urlPath = makeUrl(id);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...rejectFriendRequestMutation(urlPath),
    onSuccess: () => refreshUserData(queryClient, username, undefined),
  });

  return { status: mutation.status, onClick: () => mutation.mutate(urlPath) };
};

export const useRemoveFriend = ({ username, id }: SocialHookParams) => {
  const urlPath = makeUrl(id);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...removeFriendMutation(urlPath),
    onSuccess: async () => {
      refreshUserData(queryClient, username, undefined);
      await Promise.all([queryClient.invalidateQueries({ queryKey: listMyFriendsQueryKey() })]);
    },
  });

  return { status: mutation.status, onClick: () => mutation.mutate(urlPath) };
};
