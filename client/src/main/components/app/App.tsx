import { MantineProvider } from '@mantine/core';
import { QueryClientProvider } from '@tanstack/react-query';
import { Notifications } from '@mantine/notifications';
import { mantineConfig, queryClient } from './config';
import { GlobalStoreProvider, LocalStorageProvider, DataProvider } from 'src/main/context/provider';
import { Router } from 'src/main/components/routes/routes';

function App() {
  return (
    <MantineProvider {...mantineConfig}>
      <Notifications />
      <QueryClientProvider client={queryClient}>
        <DataProvider>
          <LocalStorageProvider>
            <GlobalStoreProvider>
              <Router />
            </GlobalStoreProvider>
          </LocalStorageProvider>
        </DataProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}

export default App;
