import { MantineProvider } from '@mantine/core';
import { MantineSettings } from 'src/main/components/settings.js';
import { Router } from 'src/main/components/routes/routes';

function App() {
  return (
    <>
      <MantineProvider {...MantineSettings}>
        <>
          <Router />
        </>
      </MantineProvider>
    </>
  );
}

export default App;
