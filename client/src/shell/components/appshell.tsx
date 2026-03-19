import { Outlet } from 'react-router';
import { ModalsProvider } from '@mantine/modals';
import { AppShell } from '@mantine/core';

import { modals } from '@/common/components/modals';

import { Header } from './header/header';

export const Shell: React.FC = () => {
  return (
    <ModalsProvider modals={modals}>
      <AppShell
        header={{ height: 'var(--site-header-height)', offset: true }}
        padding={{ base: 0.1, sm: 20 }}
      >
        <AppShell.Header>{<Header />}</AppShell.Header>
        <AppShell.Main className="main-wrap">
          <Outlet />
        </AppShell.Main>
      </AppShell>
    </ModalsProvider>
  );
};
