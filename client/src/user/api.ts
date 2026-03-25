import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  sendFriendRequestMutation,
  acceptFriendRequestMutation,
  cancelFriendRequestMutation,
  rejectFriendRequestMutation,
  removeFriendMutation,
  getUserQueryKey,
  listMyFriendsQueryKey,
} from '@/lib/api/@tanstack/react-query.gen';

interface UrlPath {
  path: { target_id: string };
}

interface SocialHookParams {
  username: string;
  id: string;
}

const makeUrl = (id: string): UrlPath => ({ path: { target_id: id } });

export const useAddFriend = ({ username, id }: SocialHookParams) => {
  const urlPath = makeUrl(id);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...sendFriendRequestMutation(urlPath),
    onSuccess: async () =>
      await queryClient.invalidateQueries({
        queryKey: getUserQueryKey({ path: { username: username } }),
      }),
  });

  return { status: mutation.status, onClick: () => mutation.mutate(urlPath) };
};

export const useAcceptRequest = ({ username, id }: SocialHookParams) => {
  const urlPath = makeUrl(id);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...acceptFriendRequestMutation(urlPath),
    onSuccess: async () =>
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getUserQueryKey({ path: { username: username } }),
        }),
        queryClient.invalidateQueries({ queryKey: listMyFriendsQueryKey() }),
      ]),
  });

  return { status: mutation.status, onClick: () => mutation.mutate(urlPath) };
};

export const useCancelRequest = ({ username, id }: SocialHookParams) => {
  const urlPath = makeUrl(id);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...cancelFriendRequestMutation(urlPath),
    onSuccess: async () =>
      await queryClient.invalidateQueries({
        queryKey: getUserQueryKey({ path: { username: username } }),
      }),
  });

  return { status: mutation.status, onClick: () => mutation.mutate(urlPath) };
};

export const useRejectRequest = ({ username, id }: SocialHookParams) => {
  const urlPath = makeUrl(id);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...rejectFriendRequestMutation(urlPath),
    onSuccess: async () =>
      await queryClient.invalidateQueries({
        queryKey: getUserQueryKey({ path: { username: username } }),
      }),
  });

  return { status: mutation.status, onClick: () => mutation.mutate(urlPath) };
};

export const useRemoveFriend = ({ username, id }: SocialHookParams) => {
  const urlPath = makeUrl(id);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    ...removeFriendMutation(urlPath),
    onSuccess: async () =>
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getUserQueryKey({ path: { username: username } }),
        }),
        queryClient.invalidateQueries({ queryKey: listMyFriendsQueryKey() }),
      ]),
  });

  return { status: mutation.status, onClick: () => mutation.mutate(urlPath) };
};
