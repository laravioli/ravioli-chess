import { useState } from 'react';
import { Combobox, useCombobox, ActionIcon, Text, Stack, Button } from '@mantine/core';
import { IconBell, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { listNotifOptions, listNotifQueryKey } from '@/lib/api/@tanstack/react-query.gen';
import { PageNotification } from '@/lib/api';
import { FriendRequestNotif } from './base';

import clsx from 'clsx';
import c from '@/shell/css/notif.module.css';

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
  const [page, setPage] = useState(1);

  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
    },
  });

  const queryClient = useQueryClient();
  const { data, refetch, isStale } = useQuery({
    ...listNotifOptions({ query: { page: page } }),
    staleTime: 5 * 60 * 1000,
    enabled: hovered,
    placeholderData: (old) => old,
  });

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
              (isStale || !hovered) && refetch();
              setHovered(true);
            }}
            onClick={() => {
              if (!combobox.dropdownOpened && page == 1) refetch();
              combobox.toggleDropdown();
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
            <Top
              page={page}
              onClick={() => {
                const previousPage = page - 1;
                queryClient.invalidateQueries({
                  queryKey: listNotifQueryKey({ query: { page: previousPage } }),
                });
                setPage(previousPage);
              }}
            />
            <PageNotif page={page} data={data} />
            {data?.pages! > 1 && page !== data?.pages! && (
              <Bottom
                onClick={() => {
                  const nextPage = page + 1;
                  queryClient.invalidateQueries({
                    queryKey: listNotifQueryKey({ query: { page: nextPage } }),
                  });
                  setPage(nextPage);
                }}
              />
            )}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    </>
  );
};

const Top: React.FC<{ page: number; onClick: () => void }> = ({ page, onClick }) => (
  <Button className={c.button} bdrs={0} mah={24} fullWidth disabled={page === 1} onClick={onClick}>
    <IconChevronUp />
  </Button>
);

const Bottom: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <Button className={clsx(c.button, c.bottom)} bdrs={0} mah={24} fullWidth onClick={onClick}>
    <IconChevronDown />
  </Button>
);
