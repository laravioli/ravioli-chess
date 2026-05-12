import { type ReactNode, useState } from 'react';
import { ActionIcon, Text, Group, Paper, Stack, rem } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

import { FriendRequestSchema } from '@/lib/api';
import { useAcceptRequest, useRejectRequest, makeSocialUrl } from '@/social/hooks';
import classes from '@/shell/css/notif.module.css';

const BaseNotification: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <Paper p="md" className={classes.card}>
      {children}
    </Paper>
  );
};

type ActionType = 'accept' | 'reject' | null;

export const FriendRequestNotif: React.FC<{
  data: FriendRequestSchema;
  onSuccess: () => Promise<void>;
}> = ({ data, onSuccess }) => {
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
    <BaseNotification>
      <Group justify="space-between" wrap="nowrap">
        <Stack gap={0}>
          <Text size="sm" fw={500}>
            {data.sender}
          </Text>
          <Text size="xs" c="dimmed">
            Wants to be your friend
          </Text>
        </Stack>
        <Group gap={10} className={classes.actions}>
          <ActionIcon
            variant="light"
            color="green"
            radius="xl"
            size={35}
            loading={activeAction === 'accept'}
            disabled={!!activeAction}
            onClick={async () => onClick('accept', acceptRequest)}
          >
            <IconCheck style={{ width: rem(20), height: rem(20) }} stroke={2.5} />
          </ActionIcon>

          <ActionIcon
            variant="light"
            color="red"
            radius="xl"
            size={35}
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
