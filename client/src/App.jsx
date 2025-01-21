import './App.css';
import 'chessboard/src/chessboard.css';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { Editor } from './components/editor/editor';

function App() {
  return (
    <MantineProvider defaultColorScheme="dark">
      <>
        <Editor />
      </>
    </MantineProvider>
  );
}

export default App;
