import { MantineProvider } from '@mantine/core';
import { MantineSettings } from 'src/main/components/settings.js';
import { Shell } from 'src/common/components/appshell/appshell';
import { Router } from 'src/main/components/routes/routes';

function App() {
  return (
    <MantineProvider {...MantineSettings}>
      <>
        <Shell>
          <Router />
        </Shell>
      </>
    </MantineProvider>
  );
}

export default App;
