import { useState } from 'react';
import {
  ActionIcon,
  Autocomplete,
  AutocompleteProps,
  Collapse,
  FocusTrap,
  Group,
  Box,
  Text,
} from '@mantine/core';
import { useClickOutside, useDebouncedValue } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import { IconSearch } from '@tabler/icons-react';
import { useNavigate } from 'react-router';

import { defined } from '@/lib/common';
import { listUserOptions } from '@/lib/api/@tanstack/react-query.gen';

interface SearchUsersWithCollapseProps {
  opened: boolean;
  close: () => void;
  toggle: () => void;
}
export const SearchUsersWithCollapse: React.FC<SearchUsersWithCollapseProps> = ({
  opened,
  close,
  toggle,
}) => {
  const ref = useClickOutside(close);
  return (
    <Group ref={ref} wrap="nowrap">
      <ActionIcon onClick={toggle} h="100%" bg="inherit">
        <IconSearch size={20} stroke={1.6} />
      </ActionIcon>
      <Collapse in={opened}>{opened && <SearchUsers close={close} />}</Collapse>
    </Group>
  );
};

const SearchUsers: React.FC<{ close: (() => void) | undefined }> = ({ close = undefined }) => {
  const [value, setValue] = useState('');
  const [debounced] = useDebouncedValue(value, 200);

  const { data } = useQuery({
    ...listUserOptions({ query: { q: debounced } }),
    enabled: debounced.length >= 3,
    staleTime: 2 * 90 * 1000,
    select: (data) => new Map(data.map((r) => [r.username, r])),
    placeholderData: (prev) => prev,
  });

  const renderAutocompleteOption: AutocompleteProps['renderOption'] = ({ option }) => {
    const user = data?.get(option.value);
    if (defined(user))
      return (
        <Group gap="xs">
          <Box
            w={8}
            h={8}
            style={{
              borderRadius: '50%',
              backgroundColor: user.online ? 'limegreen' : 'gray',
            }}
          />
          <Text size="sm">{user.username}</Text>
        </Group>
      );
  };

  const navigate = useNavigate();

  return (
    <FocusTrap>
      <Autocomplete
        placeholder="Search"
        value={value}
        onChange={setValue}
        data={data && value.length >= 3 ? [...data.keys()] : []}
        renderOption={renderAutocompleteOption}
        onOptionSubmit={(val) => navigate(`/profile/${val}`)}
        onDropdownClose={() => {
          setValue('');
          close?.();
        }}
        comboboxProps={{ withinPortal: false }}
      />
    </FocusTrap>
  );
};
