import clsx from 'clsx';
import { Tabs } from '@mantine/core';

import l from '@/user/css/layout.module.css';
import s from '@/user/css/header.module.css';

export function Header() {
  return (
    <>
      <div className={clsx(l.profileHeader, s.profileHeader)}>
        <div className={clsx(l.avatar, s.avatar)}>
          <img src="/static/images/avatar.svg"></img>
        </div>
        <div className={clsx(l.info)}>salut les terriens</div>
        <div className={clsx(l.actions)}>comment cava moi je suis un gros fanboy</div>
        <div className={clsx(l.details)}>miam miam</div>
      </div>
      <Tabs className={clsx(s.tabsHeader)} defaultValue="first">
        <Tabs.List grow>
          <Tabs.Tab value="first">Games</Tabs.Tab>
          <Tabs.Tab value="second">Social</Tabs.Tab>
        </Tabs.List>
      </Tabs>
    </>
  );
}
