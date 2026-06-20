import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Group, Button, Tabs, Image, Indicator } from '@mantine/core';
import { useParams } from 'react-router';

import { useGlobalStore } from '@/core/hooks';
import { getUserOptions } from '@/lib/api/@tanstack/react-query.gen';

import { dateFormatter } from '@/user/utils';
import l from '@/user/css/layout.module.css';
import s from '@/user/css/header.module.css';
import { SocialActions } from './social';
import { useEffect } from 'react';

import { wsConnect } from '@/lib/socket';
import { siteHandlers } from '@/core/app/socket';

const Profile: React.FC = () => {
  return (
    <div className={clsx(l.profile, s.profile)}>
      <Header />
    </div>
  );
};

const Header: React.FC = observer(() => {
  const { userStore } = useGlobalStore();
  const params = useParams();
  const queryClient = useQueryClient();
  const { data } = useQuery({
    ...getUserOptions({ path: { username: params.username! } }),
    staleTime: 30 * 1000,
  });
  const me = userStore.username === data?.username;

  useEffect(() => {
    wsConnect('/socket/site', { receive: siteHandlers(queryClient) });
  }, []);

  if (data)
    return (
      <>
        <div className={clsx(l.profileHeader, s.profileHeader)}>
          <Indicator position="top-end" color="teal" disabled={!data.online}>
            <div className={clsx(l.avatar, s.avatar)}>
              <Image src="/static/images/avatar.svg" />
            </div>
          </Indicator>
          <span className={clsx(l.info, s.info)}>{data.username}</span>
          <div className={l.actions}>
            {!me && (
              <Group justify="center" gap={0}>
                <Button variant="default">Challenge</Button>

                {userStore.isAuth && <SocialActions user={data} />}
              </Group>
            )}
          </div>
          <div className={l.details}>{dateFormatter.format(data.joined_at)}</div>
        </div>
        <Tabs className={s.tabsHeader} defaultValue="first">
          <Tabs.List grow>
            <Tabs.Tab value="first">Games</Tabs.Tab>
            <Tabs.Tab value="second">Social</Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </>
    );
});

export default Profile;
