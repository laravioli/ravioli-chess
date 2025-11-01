import { Autocomplete } from '@mantine/core';
import { useState, useEffect } from 'react';
import { useDebounce } from 'src/lib/common';
import { useQuery } from '@tanstack/react-query';
import { usersListOptions } from 'src/lib/api/@tanstack/react-query.gen';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';

export const SearchUsers = () => {
  const [value, setValue] = useState('');
  const debounceValue = useDebounce(value, 200);
  const [opened, { open }] = useDisclosure(false);

  const { data } = useQuery({
    ...usersListOptions({ query: { search: debounceValue } }),
    enabled: debounceValue.length >= 3,
    select: data => data.results.map(r => r.username),
    placeholderData: prev => prev,
  });

  const userList = value.length > 2 ? data : [];

  useEffect(() => {
    if (userList && userList.length > 0) {
      open();
    }
  }, [userList]);

  const onBlur = () => {
    setValue('');
  };

  return (
    <Autocomplete
      placeholder="Search"
      leftSection={<IconSearch size={16} stroke={1.5} />}
      value={value}
      onChange={setValue}
      data={userList}
      visibleFrom="xs"
      dropdownOpened={opened}
      onBlur={onBlur}
      comboboxProps={{ withinPortal: false }}
    />
  );
};
