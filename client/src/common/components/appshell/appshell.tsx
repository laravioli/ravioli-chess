import { ModalsProvider } from '@mantine/modals';
import { modals } from '../modals';
import { AppShell } from '@mantine/core';
import { Header } from './header/header';
import { Outlet } from 'react-router';

export const Shell = () => {
  return (
    <ModalsProvider modals={modals}>
      <AppShell header={{ height: 60, offset: true }} padding="md">
        <AppShell.Header>
          <Header />
        </AppShell.Header>
        <AppShell.Main className="main-wrap">
          <Outlet />
        </AppShell.Main>
      </AppShell>
    </ModalsProvider>
  );
};
