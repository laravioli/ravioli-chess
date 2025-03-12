import { MantineProvider } from '@mantine/core';
import { Shell } from './ui/components/appshell/appshell';
import { Editor } from './ui/components/editor/editor';

function App() {
  return (
    <MantineProvider defaultColorScheme="dark">
      <>
        <Shell>
          <Editor />
        </Shell>
      </>
    </MantineProvider>
  );
}

export default App;
