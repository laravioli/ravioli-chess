import { AppShell } from '@mantine/core';
import { Header } from './header/header';

export const Shell = ({ children }) => {
  return (
    <AppShell header={{ height: 60, offset: true }} padding="md">
      <AppShell.Header>
        <Header />
      </AppShell.Header>
      <AppShell.Main className="main-wrap">{children}</AppShell.Main>
    </AppShell>
  );
};
