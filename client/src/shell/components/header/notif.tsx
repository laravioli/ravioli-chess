import React, { ReactNode, useState } from 'react';
import { Combobox, useCombobox, ActionIcon, Text, Group, Paper, Stack, rem } from '@mantine/core';
import { IconBell, IconCheck, IconX } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';

import { listNotifOptions } from '@/lib/api/@tanstack/react-query.gen';
import { FriendRequestSchema } from '@/lib/api';
import { useAcceptRequest, useRejectRequest } from '@/social/hooks';
import classes from '@/shell/css/notif.module.css';

const BaseNotification: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <Paper withBorder p="sm" radius="md" className={classes.card}>
      {children}
    </Paper>
  );
};

const FriendRequestNotif: React.FC<{ data: FriendRequestSchema }> = ({ data }) => {
  const sender = {
    username: data.sender,
    id: data.sender_id,
  };
  const { isPending: isAccepted, onClick: onAcceptClick } = useAcceptRequest(sender);
  const { isPending: isRejected, onClick: onRejectClick } = useRejectRequest(sender);
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
        <Group gap={5} className={classes.actions}>
          <ActionIcon
            variant="light"
            color="blue"
            radius="xl"
            loading={isAccepted}
            onClick={onAcceptClick}
          >
            <IconCheck style={{ width: rem(16), height: rem(16) }} stroke={2.5} />
          </ActionIcon>

          <ActionIcon
            variant="light"
            color="red"
            radius="xl"
            loading={isRejected}
            onClick={onRejectClick}
          >
            <IconX style={{ width: rem(16), height: rem(16) }} stroke={2.5} />
          </ActionIcon>
        </Group>
      </Group>
    </BaseNotification>
  );
};
export function Notifications() {
  const [hovered, setHovered] = useState(false);
  const { data, refetch } = useQuery({
    ...listNotifOptions({ query: { page: 1 } }),
    enabled: hovered,
  });
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const options =
    data?.items.map((data) => {
      if (data.type === 'friend_request') return <FriendRequestNotif data={data} key={data.id} />;
    }) ?? [];
  return (
    <>
      <Combobox
        store={combobox}
        width={250}
        position="bottom-start"
        offset={15}
        radius={0}
        withinPortal={false}
        onOptionSubmit={() => {
          combobox.closeDropdown();
        }}
      >
        <Combobox.Target>
          <ActionIcon
            bg="inherit"
            onMouseEnter={() => {
              !hovered && refetch();
              setHovered(true);
            }}
            onClick={() => {
              if (!combobox.dropdownOpened) refetch();
              combobox.toggleDropdown();
            }}
          >
            <IconBell size={20} stroke={1.4} />
          </ActionIcon>
        </Combobox.Target>

        <Combobox.Dropdown>
          <Combobox.Options mah={300} style={{ overflowY: 'auto' }}>
            {options.length > 0 ? (
              options
            ) : (
              <Stack align="center" gap="xs" py="md">
                <Text size="sm" c="dimmed" fw={500}>
                  No new notifications.
                </Text>
              </Stack>
            )}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    </>
  );
}
