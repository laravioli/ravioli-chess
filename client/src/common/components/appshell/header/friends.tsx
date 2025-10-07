import { useQuery } from '@tanstack/react-query';
import { friendsListOptions } from 'src/lib/api/@tanstack/react-query.gen';
import { Affix, Menu } from '@mantine/core';
import { IconFriends } from '@tabler/icons-react';
import classes from '../../../css/header.module.css';

export const HeaderFriends = () => {
  const { data, refetch, isFetching } = useQuery({
    ...friendsListOptions(),
    enabled: false,
  });

  return (
    <Affix position={{ top: 80, right: -5 }}>
      <Menu
        trigger="click"
        position="bottom-start"
        offset={10}
        radius={2}
        transitionProps={{ exitDuration: 0 }}
        withinPortal
      >
        <Menu.Target>
          <div
            className={classes.link}
            onMouseOver={() => {
              if (!data && !isFetching) {
                refetch();
              }
            }}
            onClick={event => {
              event.preventDefault();
            }}
          >
            <IconFriends color="gray" />
          </div>
        </Menu.Target>
        <Menu.Dropdown>
          {data?.results.map(item => (
            <Menu.Item key={item.to_user} onClick={() => {}}>
              {item.to_user}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    </Affix>
  );
};
