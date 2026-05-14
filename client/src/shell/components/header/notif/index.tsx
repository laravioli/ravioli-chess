import { useCallback, useRef, useState } from 'react';
import {
  Combobox,
  useCombobox,
  ActionIcon,
  Text,
  Stack,
  Button,
  Indicator,
  Tooltip,
  Group,
} from '@mantine/core';
import { IconBell, IconChevronDown, IconChevronUp, IconTrash } from '@tabler/icons-react';
import { defined } from '@/lib/common';
import { FriendRequestNotif } from './content';

import clsx from 'clsx';
import c from '@/shell/css/notif.module.css';

import { useNotification, type Notifs } from './hooks';

export const Notifications: React.FC = () => {
  const [hovered, setHovered] = useState(false);
  const timeoutId = useRef<number>(-1);

  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    },
  });

  const uiState = {
    dropdownOpened: combobox.dropdownOpened,
    hovered,
  };

  const notifications = useNotification(uiState);

  const onOpen = useCallback(() => {
    if (notifications.page === 1) {
      timeoutId.current = setTimeout(() => {
        notifications.invalidate(1);
      }, 200);
    }
  }, [notifications.page]);

  const unRead = notifications.data?.unread ?? 0;

  return (
    <>
      <Combobox
        store={combobox}
        width={310}
        position="bottom"
        offset={{ mainAxis: 15, crossAxis: -17 }}
        radius={0}
        withinPortal={false}
        onOpen={onOpen}
        onOptionSubmit={() => {
          combobox.closeDropdown();
        }}
      >
        <Combobox.Target>
          <Tooltip
            classNames={{ tooltip: c.tooltip, arrow: c.tooltipArrow }}
            label={`notifications: ${unRead}`}
            hidden={unRead === 0 || combobox.dropdownOpened}
            withArrow
            openDelay={400}
            arrowSize={6}
            offset={17}
            transitionProps={{ transition: 'pop', duration: 150 }}
          >
            <ActionIcon
              bg="inherit"
              onMouseEnter={() => {
                setHovered(true);
              }}
              onClick={() => combobox.toggleDropdown()}
              styles={{
                root: {
                  transform: 'none',
                },
              }}
            >
              <Indicator
                inline
                size={9}
                offset={4}
                color="red"
                withBorder
                processing
                zIndex={10}
                disabled={
                  !defined(notifications.data?.unread) ||
                  notifications.data?.unread === 0 ||
                  (combobox.dropdownOpened && notifications.page === 1)
                }
              >
                <IconBell size={20} stroke={1.4} />
              </Indicator>
            </ActionIcon>
          </Tooltip>
        </Combobox.Target>

        <Combobox.Dropdown classNames={{ dropdown: c.dropdown }}>
          <Combobox.Options mah={500} style={{ overflowY: 'auto' }}>
            <Group gap={0} wrap="nowrap" align="stretch">
              {notifications.data?.total! > 0 && (
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size={22}
                  radius={0}
                  onClick={notifications.clear}
                >
                  <IconTrash size={20} />
                </ActionIcon>
              )}
              <Button
                className={c.button}
                bdrs={0}
                mah={24}
                fullWidth
                disabled={notifications.page === 1}
                onClick={() => {
                  notifications.setPage(notifications.page - 1);
                }}
              >
                <IconChevronUp />
              </Button>
            </Group>
            <PageNotif notifications={notifications} />
            {!!notifications.maxPage && notifications.page < notifications.maxPage && (
              <Button
                className={clsx(c.button, c.bottom)}
                bdrs={0}
                mah={24}
                fullWidth
                onClick={() => {
                  notifications.setPage(notifications.page + 1);
                }}
              >
                <IconChevronDown />
              </Button>
            )}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    </>
  );
};

const PageNotif: React.FC<{
  notifications: Notifs;
}> = ({ notifications }) => {
  const options =
    notifications.data?.items.map((data) => {
      if (data.type === 'friend_request')
        return (
          <FriendRequestNotif
            data={data}
            key={data.id}
            onSuccess={() => notifications.invalidate(notifications.page)}
          />
        );
    }) ?? [];

  return (
    <>
      {options.length > 0 ? (
        options
      ) : (
        <Combobox.Empty>
          <Stack align="center" gap="xs" py="md">
            <Text size="sm" c="dimmed" fw={500}>
              {notifications.page == 1 ? 'No new notifications.' : 'No more notifications'}
            </Text>
          </Stack>
        </Combobox.Empty>
      )}
    </>
  );
};
