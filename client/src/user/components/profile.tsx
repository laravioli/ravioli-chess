import clsx from 'clsx';
import { useQuery } from '@tanstack/react-query';
import { Group, Button, Tabs } from '@mantine/core';
import { useParams } from 'react-router';

import { useGlobalStore } from '@/core/hooks/hooks';
import { type UserProfile } from '@/lib/api';
import { getUserOptions } from '@/lib/api/@tanstack/react-query.gen';

import { dateFormatter } from '@/user/utils';
import l from '@/user/css/layout.module.css';
import s from '@/user/css/header.module.css';
import { SocialActions } from './social';
import { IsAuth } from './isauth';

const Profile: React.FC = () => {
  const params = useParams();
  const { data } = useQuery({
    ...getUserOptions({ path: { username: params.username! } }),
  });

  //this should be always true thanks to eagier loading in router
  if (data)
    return (
      <div className={clsx(l.profile, s.profile)}>
        <Header user={data} />
      </div>
    );
};

const Header: React.FC<{ user: UserProfile }> = ({ user }) => {
  const { userStore } = useGlobalStore();
  return (
    <>
      <div className={clsx(l.profileHeader, s.profileHeader)}>
        <div className={clsx(l.avatar, s.avatar)}>
          <img src="/static/images/avatar.svg"></img>
        </div>
        <span className={clsx(l.info, s.info)}>{user.username}</span>
        <div className={l.actions}>
          {userStore.username !== user.username && (
            <Group justify="center" gap={0}>
              <IsAuth showIf={true}>
                <SocialActions user={user} />
              </IsAuth>
              <Button variant="default">Challenge</Button>
            </Group>
          )}
        </div>
        <div className={l.details}>{dateFormatter.format(user.joined_at)}</div>
      </div>
      <Tabs className={s.tabsHeader} defaultValue="first">
        <Tabs.List grow>
          <Tabs.Tab value="first">Games</Tabs.Tab>
          <Tabs.Tab value="second">Social</Tabs.Tab>
        </Tabs.List>
      </Tabs>
    </>
  );
};

export default Profile;
