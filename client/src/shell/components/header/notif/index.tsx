import { useCallback, useRef, useState } from 'react';
import { Combobox, useCombobox, ActionIcon, Text, Stack, Button, Indicator } from '@mantine/core';
import { IconBell, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
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
                notifications.data?.unread === 0 ||
                (combobox.dropdownOpened && notifications.page === 1)
              }
            >
              <IconBell size={20} stroke={1.4} />
            </Indicator>
          </ActionIcon>
        </Combobox.Target>

        <Combobox.Dropdown classNames={{ dropdown: c.dropdown }}>
          <Combobox.Options mah={500} style={{ overflowY: 'auto' }}>
            <Button
              className={c.button}
              bdrs={0}
              mah={24}
              fullWidth
              disabled={notifications.page === 1}
              onClick={() => {
                const previousPage = notifications.page - 1;
                notifications.setPage(previousPage);
              }}
            >
              <IconChevronUp />
            </Button>
            <PageNotif notifications={notifications} />
            {!!notifications.maxPage && notifications.page < notifications.maxPage && (
              <Button
                className={clsx(c.button, c.bottom)}
                bdrs={0}
                mah={24}
                fullWidth
                onClick={() => {
                  const nextPage = notifications.page + 1;
                  notifications.setPage(nextPage);
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
        <Stack align="center" gap="xs" py="md">
          <Text size="sm" c="dimmed" fw={500}>
            {notifications.page == 1 ? 'No new notifications.' : 'No more notifications'}
          </Text>
        </Stack>
      )}
    </>
  );
};
