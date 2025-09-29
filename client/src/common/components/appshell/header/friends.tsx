import { useQuery } from '@tanstack/react-query';
import { friendsListOptions } from 'src/lib/api/@tanstack/react-query.gen';
import { Menu } from '@mantine/core';
import classes from '../../../css/header.module.css';

export const HeaderFriends = () => {
  const { data, refetch, isFetching } = useQuery({
    ...friendsListOptions(),
    enabled: false,
  });

  return (
    <Menu
      trigger="click-hover"
      position="bottom-start"
      offset={0}
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
            console.log('click');
            event.preventDefault();
          }}
        >
          Friends
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
  );
};
