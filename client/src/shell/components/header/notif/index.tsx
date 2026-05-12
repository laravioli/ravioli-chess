import { useCallback, useRef, useState } from 'react';
import { Combobox, useCombobox, ActionIcon, Text, Stack, Button } from '@mantine/core';
import { IconBell, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';

import { listNotifQueryKey } from '@/lib/api/@tanstack/react-query.gen';
import { PageNotification } from '@/lib/api';
import { FriendRequestNotif } from './content';

import clsx from 'clsx';
import c from '@/shell/css/notif.module.css';

import { useNotification } from './hooks';

//todo work on the notif event
// 2) trash button
// 3) read/unread red color feature
// 4) Generic notif "MSG" -> you are now friend with..
const PageNotif: React.FC<{
  page: number;
  data: PageNotification | undefined;
}> = ({ page, data }) => {
  const queryClient = useQueryClient();
  const invalidateQueries = () =>
    queryClient.invalidateQueries({ queryKey: listNotifQueryKey({ query: { page: page } }) });
  const options =
    data?.items.map((data) => {
      if (data.type === 'friend_request')
        return <FriendRequestNotif data={data} key={data.id} onSuccess={invalidateQueries} />;
    }) ?? [];

  return (
    <>
      {options.length > 0 ? (
        options
      ) : (
        <Stack align="center" gap="xs" py="md">
          <Text size="sm" c="dimmed" fw={500}>
            {page == 1 ? 'No new notifications.' : 'No more notifications'}
          </Text>
        </Stack>
      )}
    </>
  );
};

export const Notifications: React.FC = () => {
  const [hovered, setHovered] = useState(false);

  const clearId = useRef<number | null>(null);

  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
      setPage(1);
      clearId.current = null;
    },
  });

  const { data, page, invalidate, setPage } = useNotification({
    dropdownOpened: combobox.dropdownOpened,
    hovered,
  });

  const nav = useCallback(
    (page: number) => {
      invalidate(page);
      setPage(page);
    },
    [invalidate, setPage],
  );

  return (
    <>
      <Combobox
        store={combobox}
        width={310}
        position="bottom"
        offset={{ mainAxis: 15, crossAxis: -17 }}
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
              setHovered(true);
            }}
            onClick={() => {
              combobox.toggleDropdown();
              if (!combobox.dropdownOpened)
                clearId.current = setTimeout(() => {
                  if (clearId.current) invalidate(1);
                  clearId.current = null;
                }, 200);
            }}
            styles={{
              root: {
                transform: 'none',
              },
            }}
          >
            <IconBell size={20} stroke={1.4} />
          </ActionIcon>
        </Combobox.Target>

        <Combobox.Dropdown classNames={{ dropdown: c.dropdown }}>
          <Combobox.Options mah={500} style={{ overflowY: 'auto' }}>
            <Button
              className={c.button}
              bdrs={0}
              mah={24}
              fullWidth
              disabled={page === 1}
              onClick={() => {
                const previousPage = page - 1;
                nav(previousPage);
              }}
            >
              <IconChevronUp />
            </Button>
            <PageNotif page={page} data={data} />
            {data?.pages! > 1 && page !== data?.pages! && (
              <Button
                className={clsx(c.button, c.bottom)}
                bdrs={0}
                mah={24}
                fullWidth
                onClick={() => {
                  const nextPage = page + 1;
                  nav(nextPage);
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
