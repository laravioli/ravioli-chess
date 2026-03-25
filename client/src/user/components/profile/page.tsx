import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { useQuery } from '@tanstack/react-query';
import { Group, Button, Tabs } from '@mantine/core';
import { useParams } from 'react-router';

import { useGlobalStore } from '@/core/hooks/hooks';
import { getUserOptions } from '@/lib/api/@tanstack/react-query.gen';

import { dateFormatter } from '@/user/utils';
import l from '@/user/css/layout.module.css';
import s from '@/user/css/header.module.css';
import { SocialActions } from './social';

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
  const { data } = useQuery({
    ...getUserOptions({ path: { username: params.username! } }),
  });

  console.log(getUserOptions({ path: { username: params.username! } }));

  if (data)
    return (
      <>
        <div className={clsx(l.profileHeader, s.profileHeader)}>
          <div className={clsx(l.avatar, s.avatar)}>
            <img src="/static/images/avatar.svg"></img>
          </div>
          <span className={clsx(l.info, s.info)}>{data.username}</span>
          <div className={l.actions}>
            {userStore.username !== data.username && (
              <Group justify="center" gap={0}>
                <Button variant="default">Challenge</Button>

                {userStore.logged && <SocialActions user={data} />}
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
