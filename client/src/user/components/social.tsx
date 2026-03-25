import { Button } from '@mantine/core';

import type { UserProfile } from '@/lib/api';

import * as api from '@/user/api';

interface ActionProps {
  user: UserProfile;
  label: string;
  useHook: (args: { username: string; id: string }) => { status: string; onClick: () => void };
}

const SocialActionButton: React.FC<ActionProps> = ({ user, label, useHook }) => {
  const { status, onClick } = useHook({ username: user.username, id: user.id });

  return (
    <Button variant="default" loading={status === 'pending'} onClick={onClick}>
      {label}
    </Button>
  );
};

export const SocialActions: React.FC<{ user: UserProfile }> = ({ user }) => {
  const friendship = user.friendship;

  if (!friendship) {
    return <SocialActionButton user={user} label="Add friend" useHook={api.useAddFriend} />;
  }

  switch (friendship.status) {
    case 'accepted':
      return <SocialActionButton user={user} label="Remove friend" useHook={api.useRemoveFriend} />;

    case 'pending':
      return friendship.is_sender ? (
        <SocialActionButton user={user} label="Cancel Request" useHook={api.useCancelRequest} />
      ) : (
        <>
          <SocialActionButton user={user} label="Accept" useHook={api.useAcceptRequest} />
          <SocialActionButton user={user} label="Reject" useHook={api.useRejectRequest} />
        </>
      );

    default:
      return null;
  }
};
