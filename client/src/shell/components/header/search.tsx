import { useState } from 'react';
import { ActionIcon, Autocomplete, Collapse, FocusTrap, Group } from '@mantine/core';
import { useClickOutside, useDebouncedValue } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import { IconSearch } from '@tabler/icons-react';
import { useNavigate } from 'react-router';

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
      <Collapse in={opened}>{opened && <SearchUsers closeCollapse={close} />}</Collapse>
    </Group>
  );
};

const SearchUsers: React.FC<{ closeCollapse: () => void }> = ({ closeCollapse }) => {
  const [value, setValue] = useState('');
  const [debounced] = useDebouncedValue(value, 200);

  const { data } = useQuery({
    ...listUserOptions({ query: { q: debounced } }),
    enabled: debounced.length >= 3,
    select: (data) => data.map((r) => r.username),
    placeholderData: (prev) => prev,
  });

  const userList = value.length >= 3 ? data : [];
  const navigate = useNavigate();

  return (
    <FocusTrap>
      <Autocomplete
        placeholder="Search"
        value={value}
        onChange={setValue}
        data={userList}
        onOptionSubmit={(val) => navigate(`/profile/${val}`)}
        onDropdownClose={() => {
          setValue('');
          closeCollapse();
        }}
        comboboxProps={{ withinPortal: false }}
      />
    </FocusTrap>
  );
};
