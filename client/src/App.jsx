import { MantineProvider } from '@mantine/core';
import { Shell } from './ui/components/appshell/appshell';
import { Router } from './ui/routes/routes';

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
