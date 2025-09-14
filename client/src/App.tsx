import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { MantineSettings } from 'src/main/components/settings';
import { GlobalStoreProvider, LocalStorageProvider, DataProvider } from 'src/main/context/provider';
import { Router } from 'src/main/components/routes/routes';

function App() {
  return (
    <>
      <MantineProvider {...MantineSettings}>
        <Notifications />
        <DataProvider>
          <LocalStorageProvider>
            <GlobalStoreProvider>
              <Router />
            </GlobalStoreProvider>
          </LocalStorageProvider>
        </DataProvider>
      </MantineProvider>
    </>
  );
}

export default App;
