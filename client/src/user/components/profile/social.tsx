import { Button } from '@mantine/core';

import type { UserProfile } from '@/lib/api';

import {
  useAddFriend,
  useRemoveFriend,
  useCancelRequest,
  useAcceptRequest,
  useRejectRequest,
  makeSocialUrl,
} from '@/social/api';

interface ActionProps {
  user: UserProfile;
  label: string;
  useHook:
    | typeof useAddFriend
    | typeof useRemoveFriend
    | typeof useCancelRequest
    | typeof useRejectRequest;
}

const SocialActionButton: React.FC<ActionProps> = ({ user, label, useHook }) => {
  const { status, mutate } = useHook({ username: user.username });

  return (
    <Button
      variant="default"
      loading={status === 'pending'}
      onClick={() => mutate(makeSocialUrl(user.id))}
    >
      {label}
    </Button>
  );
};

export const SocialActions: React.FC<{ user: UserProfile }> = ({ user }) => {
  const friendship = user.friendship;

  if (!friendship) {
    return <SocialActionButton user={user} label="Add friend" useHook={useAddFriend} />;
  }

  switch (friendship.status) {
    case 'accepted':
      return <SocialActionButton user={user} label="Remove friend" useHook={useRemoveFriend} />;

    case 'pending':
      return friendship.is_sender ? (
        <SocialActionButton user={user} label="Cancel Request" useHook={useCancelRequest} />
      ) : (
        <>
          <SocialActionButton user={user} label="Accept" useHook={useAcceptRequest} />
          <SocialActionButton user={user} label="Reject" useHook={useRejectRequest} />
        </>
      );

    default:
      return null;
  }
};
