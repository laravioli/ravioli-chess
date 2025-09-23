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
  const [userList, setUserList] = useState<string[]>([]);
  const [opened, { open }] = useDisclosure(false);

  const { data, isPending, isError } = useQuery({
    ...usersListOptions({ query: { search: debounceValue } }),
    enabled: debounceValue.length >= 3,
  });

  useEffect(() => {
    if (value.length < 3) {
      setUserList([]);
      return;
    }
    if (!isPending && !isError) {
      setUserList(data.results.map(r => r.username));
      open();
    }
  }, [data, value, isPending, isError]);

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
    />
  );
};
