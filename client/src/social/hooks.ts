import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  sendFriendRequestMutation,
  acceptFriendRequestMutation,
  cancelFriendRequestMutation,
  rejectFriendRequestMutation,
  removeFriendMutation,
  getUserQueryKey,
  listMyFriendsQueryKey,
  listNotifQueryKey,
} from '@/lib/api/@tanstack/react-query.gen';

import type { GetUserResponse, FriendShip, ListNotifResponse } from '@/lib/api';

interface UrlPath {
  path: { target_id: string };
}

interface SocialHookParams {
  username: string;
  id: string;
}

const makeUrl = (id: string): UrlPath => ({ path: { target_id: id } });

const refreshUserData = (queryClient: QueryClient, username: string, friendship?: FriendShip) => {
  queryClient.setQueryData<GetUserResponse>(getUserQueryKey({ path: { username } }), (old) =>
    old ? { ...old, friendship } : old,
  );
};

const refreshNotifData = (queryClient: QueryClient, id: string) => {
  queryClient.setQueryData<ListNotifResponse>(listNotifQueryKey(), (old) =>
    old?.filter((item) => item.type !== 'friend_request' || item.sender_id !== id),
  );
};

export const useAddFriend = ({ username, id }: SocialHookParams) => {
  const urlPath = makeUrl(id);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...sendFriendRequestMutation(urlPath),
    onSuccess: (friendship) => refreshUserData(queryClient, username, friendship),
  });

  return { ...mutation, onClick: () => mutation.mutate(urlPath) };
};

export const useCancelRequest = ({ username, id }: SocialHookParams) => {
  const urlPath = makeUrl(id);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...cancelFriendRequestMutation(urlPath),
    onSuccess: () => refreshUserData(queryClient, username, undefined),
  });

  return { ...mutation, onClick: () => mutation.mutate(urlPath) };
};

export const useAcceptRequest = ({ username, id }: SocialHookParams) => {
  const urlPath = makeUrl(id);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...acceptFriendRequestMutation(urlPath),
    onSuccess: async (friendhsip) => {
      refreshUserData(queryClient, username, friendhsip);
      refreshNotifData(queryClient, id);
      await queryClient.invalidateQueries({ queryKey: listMyFriendsQueryKey() });
    },
  });

  return { ...mutation, onClick: () => mutation.mutate(urlPath) };
};

export const useRejectRequest = ({ username, id }: SocialHookParams) => {
  const urlPath = makeUrl(id);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...rejectFriendRequestMutation(urlPath),
    onSuccess: () => {
      refreshUserData(queryClient, username, undefined);
      refreshNotifData(queryClient, id);
    },
  });

  return { ...mutation, onClick: () => mutation.mutate(urlPath) };
};

export const useRemoveFriend = ({ username, id }: SocialHookParams) => {
  const urlPath = makeUrl(id);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...removeFriendMutation(urlPath),
    onSuccess: async () => {
      refreshUserData(queryClient, username, undefined);
      await queryClient.invalidateQueries({ queryKey: listMyFriendsQueryKey() });
    },
  });

  return { ...mutation, onClick: () => mutation.mutate(urlPath) };
};
