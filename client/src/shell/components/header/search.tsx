import { useState } from 'react';
import { useClickOutside, useDebouncedValue } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import { usersListOptions } from 'src/lib/api/@tanstack/react-query.gen';
import { ActionIcon, Autocomplete, Collapse, FocusTrap, Group } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

export const SearchUsersWithCollapse = ({
  opened,
  close,
  toggle,
}: {
  opened: boolean;
  close: () => void;
  toggle: () => void;
}) => {
  const ref = useClickOutside(close);
  return (
    <Group ref={ref} wrap="nowrap">
      <ActionIcon onClick={toggle} h="100%" bg="inherit">
        <IconSearch size={20} stroke={1.6} />
      </ActionIcon>
      <Collapse in={opened}>{opened && <SearchUsers />}</Collapse>
    </Group>
  );
};

const SearchUsers = () => {
  const [value, setValue] = useState('');
  const [debounced] = useDebouncedValue(value, 200);

  const { data } = useQuery({
    ...usersListOptions({ query: { search: debounced } }),
    enabled: debounced.length >= 3,
    select: data => data.results.map(r => r.username),
    placeholderData: prev => prev,
  });

  const userList = value.length > 2 ? data : [];

  return (
    <FocusTrap>
      <Autocomplete
        placeholder="Search"
        value={value}
        onChange={setValue}
        data={userList}
        comboboxProps={{ withinPortal: false }}
      />
    </FocusTrap>
  );
};
