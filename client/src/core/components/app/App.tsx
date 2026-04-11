import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';

import { GlobalStoreProvider, DataProvider } from '@/core/context/provider';
import { createRouter } from '@/core/components/routes/routes';
import type { AppDependencies } from './config';

const App: React.FC<AppDependencies> = (dep) => {
  return (
    <MantineProvider {...dep.mantineConfig}>
      <Notifications />
      <QueryClientProvider client={dep.queryClient}>
        <GlobalStoreProvider globalStore={dep.globalStore}>
          <DataProvider data={dep.data}>
            <RouterProvider router={createRouter(dep.queryClient)} />
          </DataProvider>
        </GlobalStoreProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
};

export default App;
