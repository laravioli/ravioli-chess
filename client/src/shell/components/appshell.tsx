import { ModalsProvider } from '@mantine/modals';
import { modals } from 'src/common/components/modals';
import { AppShell } from '@mantine/core';
import { Header } from './header/header';
import { Outlet } from 'react-router';

export const Shell = () => {
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
