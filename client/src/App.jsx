import { BrowserRouter, Routes, Route } from 'react-router';
import { MantineProvider } from '@mantine/core';
import { Shell } from './ui/components/appshell/appshell';
import { Editor } from './ui/pages/editor';
import { Analyse } from './ui/pages/analyse';

function App() {
  return (
    <MantineProvider defaultColorScheme="dark">
      <>
        <Shell>
          <BrowserRouter>
            <Routes>
              <Route index element={<Editor />} />
              <Route path="analyse" element={<Analyse />} />
            </Routes>
          </BrowserRouter>
        </Shell>
      </>
    </MantineProvider>
  );
}

export default App;
