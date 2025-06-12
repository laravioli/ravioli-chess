import { MantineProvider } from '@mantine/core';
import { MantineSettings } from 'src/main/components/settings.js';
import { DataProvider } from 'src/main/context/provider';
import { Router } from 'src/main/components/routes/routes';

function App() {
  return (
    <>
      <MantineProvider {...MantineSettings}>
        <DataProvider>
          <Router />
        </DataProvider>
      </MantineProvider>
    </>
  );
}

export default App;
