import { MantineProvider } from '@mantine/core';
import { Shell } from 'src/shared/components/appshell/appshell';
import { Router } from 'src/main/components/routes/routes';

function App() {
  return (
    <MantineProvider defaultColorScheme="dark">
      <>
        <Shell>
          <Router />
        </Shell>
      </>
    </MantineProvider>
  );
}

export default App;
