import { type ReactNode, useState } from 'react';
import { ActionIcon, Text, Group, Paper, Stack, rem } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

import { FriendRequestSchema } from '@/lib/api';
import { useAcceptRequest, useRejectRequest, makeSocialUrl } from '@/social/hooks';
import classes from '@/shell/css/notif.module.css';
import clsx from 'clsx';

const BaseNotification: React.FC<{
  children: ReactNode;
  className?: string[];
}> = ({ children, className = [] }) => {
  return (
    <Paper p="md" className={clsx([classes.card, ...className])}>
      {children}
    </Paper>
  );
};

type ActionType = 'accept' | 'reject' | null;

export const FriendRequestNotif: React.FC<{
  data: FriendRequestSchema;
  onSuccess: () => Promise<void>;
  className?: string[];
}> = ({ data, onSuccess, className = [] }) => {
  const sender = {
    username: data.sender,
    id: data.sender_id,
  };
  const [activeAction, setActiveAction] = useState<ActionType>(null);

  const { mutateAsync: acceptRequest } = useAcceptRequest(sender);
  const { mutateAsync: rejectRequest } = useRejectRequest(sender);

  const onClick = async (
    type: ActionType,
    mutateAsync: typeof acceptRequest | typeof rejectRequest,
  ) => {
    try {
      setActiveAction(type);
      await mutateAsync(makeSocialUrl(sender.id));
      await onSuccess();
    } catch (e) {
      console.log(e);
    } finally {
      setActiveAction(null);
    }
  };

  return (
    <BaseNotification className={className}>
      <Group justify="space-between" wrap="nowrap">
        <Stack gap={0}>
          <Text size="sm" fw={500}>
            {data.sender}
          </Text>
          <Text size="xs" c="dimmed">
            Wants to be your friend
          </Text>
        </Stack>
        <Group gap={30} className={classes.actions}>
          <ActionIcon
            variant="light"
            color="blue"
            radius={0}
            size={45}
            loading={activeAction === 'accept'}
            disabled={!!activeAction}
            onClick={async () => onClick('accept', acceptRequest)}
          >
            <IconCheck style={{ width: rem(20), height: rem(20) }} stroke={2.5} />
          </ActionIcon>

          <ActionIcon
            variant="light"
            color="red"
            radius={0}
            size={45}
            loading={activeAction === 'reject'}
            disabled={!!activeAction}
            onClick={async () => onClick('reject', rejectRequest)}
          >
            <IconX style={{ width: rem(20), height: rem(20) }} stroke={2.5} />
          </ActionIcon>
        </Group>
      </Group>
    </BaseNotification>
  );
};
