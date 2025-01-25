import './App.css';
import 'chessboard/src/chessboard.css';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { Shell } from './components/appshell/appshell';
import { Editor } from './components/editor/editor';

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
