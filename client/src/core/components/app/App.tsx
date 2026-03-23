import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';

import { GlobalStoreProvider, LocalStorageProvider, DataProvider } from '@/core/context/provider';
import { router } from '@/core/components/routes/routes';
import type { AppDependencies } from './config';

const App: React.FC<AppDependencies> = (dep) => {
  return (
    <MantineProvider {...dep.mantineConfig}>
      <Notifications />
      <QueryClientProvider client={dep.queryClient}>
        <LocalStorageProvider localStorage={dep.localStorage}>
          <GlobalStoreProvider globalStore={dep.globalStore}>
            <DataProvider data={dep.data}>
              <RouterProvider router={router} />
            </DataProvider>
          </GlobalStoreProvider>
        </LocalStorageProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
};

export default App;
