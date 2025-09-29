import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClientProvider } from '@tanstack/react-query';
import { GlobalStoreProvider, LocalStorageProvider, DataProvider } from 'src/main/context/provider';
import { Router } from 'src/main/components/routes/routes';
import type { AppDependencies } from './config';

function App(dep: AppDependencies) {
  return (
    <MantineProvider {...dep.mantineConfig}>
      <Notifications />
      <QueryClientProvider client={dep.queryClient}>
        <LocalStorageProvider localStorage={dep.localStorage}>
          <GlobalStoreProvider globalStore={dep.globalStore}>
            <DataProvider data={dep.data}>
              <Router />
            </DataProvider>
          </GlobalStoreProvider>
        </LocalStorageProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}

export default App;
