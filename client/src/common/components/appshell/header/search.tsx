import { Autocomplete } from '@mantine/core';
import { usersList } from 'src/lib/api';
import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDisclosure } from '@mantine/hooks';
import { debounce } from 'src/lib/common';
import { IconSearch } from '@tabler/icons-react';

import { usersListOptions } from 'src/lib/api/@tanstack/react-query.gen';

export const SearchUsers = () => {
  const [value, setValue] = useState('');
  const [data, setData] = useState<string[]>([]);
  const [opened, { open }] = useDisclosure(false);

  const debouncedFetchUsers = useMemo(
    () =>
      debounce(async (search: string) => {
        if (search.length < 3) {
          setData([]);
          return;
        }
        try {
          const { data } = await usersList({ query: { search } });
          if (data) {
            const users = data.results.map(r => r.username);
            setData(users);
            open();
          }
        } catch (error) {
          console.error(error);
          setData([]);
          close();
        }
      }, 250),
    [],
  );

  useEffect(() => {
    debouncedFetchUsers(value);
  }, [value]);

  const onBlur = () => {
    setValue('');
    setData([]);
  };

  return (
    <Autocomplete
      placeholder="Search"
      leftSection={<IconSearch size={16} stroke={1.5} />}
      value={value}
      onChange={setValue}
      data={data}
      visibleFrom="xs"
      dropdownOpened={opened}
      onBlur={onBlur}
    />
  );
};

export const SearchUsers2 = () => {
  const [value, setValue] = useState('');
  const debounceValue = useDebounce(value, 250);
  const [userList, setUserList] = useState<string[]>([]);
  const [opened, { open }] = useDisclosure(false);

  console.log(usersListOptions({ query: { search: debounceValue } }));

  const { data, isPending, isError } = useQuery({
    ...usersListOptions({ query: { search: debounceValue } }),
    enabled: debounceValue.length >= 3,
  });

  useEffect(() => {
    console.log('effect');
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

export default function useDebounce(value: any, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
