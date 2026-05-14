import clsx from 'clsx';
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
import c from '@/shell/css/notif.module.css';
import { defined } from '@/lib/common';
import * as api from './api';
import { FriendRequestNotif } from './content';

export const Notifications: React.FC = () => {
  const [page, setPage] = useState(1);
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

  const onNotif = useCallback(() => {
    if (page > 1) setPage(1);
    return combobox.dropdownOpened;
  }, [page, combobox.dropdownOpened]);

  const unreadCount = api.useNotificationCount(onNotif);

  const { notifications, refetch } = api.useNotificationData(page);
  const action = api.useNotificationAction();

  const onDropdownOpen = useCallback((page: number) => {
    if (page === 1) {
      timeoutId.current = setTimeout(() => {
        action.invalidate(1);
      }, 200);
    }
  }, []);

  return (
    <>
      <Combobox
        store={combobox}
        width={310}
        position="bottom"
        offset={{ mainAxis: 15, crossAxis: -17 }}
        radius={0}
        withinPortal={false}
        onOpen={() => onDropdownOpen(page)}
        onOptionSubmit={() => {
          combobox.closeDropdown();
        }}
      >
        <Combobox.Target>
          <Tooltip
            classNames={{ tooltip: c.tooltip, arrow: c.tooltipArrow }}
            label={`notifications: ${unreadCount}`}
            hidden={unreadCount === 0 || combobox.dropdownOpened}
            withArrow
            openDelay={400}
            arrowSize={6}
            offset={17}
            transitionProps={{ transition: 'pop', duration: 150 }}
          >
            <ActionIcon
              bg="inherit"
              onMouseEnter={() => {
                if (!hovered) {
                  refetch();
                  setHovered(true);
                }
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
                disabled={unreadCount === 0 || (combobox.dropdownOpened && page === 1)}
              >
                <IconBell size={20} stroke={1.4} />
              </Indicator>
            </ActionIcon>
          </Tooltip>
        </Combobox.Target>

        <Combobox.Dropdown classNames={{ dropdown: c.dropdown }}>
          <Combobox.Options mah={500} style={{ overflowY: 'auto' }}>
            <Group gap={0} wrap="nowrap" align="stretch">
              {(notifications?.total ?? 0) > 0 && (
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size={22}
                  radius={0}
                  onClick={action.clear}
                >
                  <IconTrash size={20} />
                </ActionIcon>
              )}
              <Button
                className={c.button}
                bdrs={0}
                mah={24}
                fullWidth
                disabled={page === 1}
                onClick={() => {
                  action.invalidate(page - 1);
                  setPage(page - 1);
                }}
              >
                <IconChevronUp />
              </Button>
            </Group>
            <PageNotif notifications={notifications} invalidate={action.invalidate} />
            {notifications && notifications.page < notifications.pages && (
              <Button
                className={clsx(c.button, c.bottom)}
                bdrs={0}
                mah={24}
                fullWidth
                onClick={() => {
                  action.invalidate(page + 1);
                  setPage(page + 1);
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
  notifications: api.NotificationData;
  invalidate: (page: number) => Promise<void>;
}> = ({ notifications, invalidate }) => {
  const options =
    notifications?.items.map((data) => {
      if (data.type === 'friend_request')
        return (
          <FriendRequestNotif
            data={data}
            key={data.id}
            onSuccess={() => invalidate(notifications.page)}
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
              {!defined(notifications) || notifications.page == 1
                ? 'No new notifications.'
                : 'No more notifications'}
            </Text>
          </Stack>
        </Combobox.Empty>
      )}
    </>
  );
};
