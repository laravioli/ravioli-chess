import { Shell } from 'src/shell/components/appshell';
import { BrowserRouter, Routes, Route } from 'react-router';
import Analyse from 'src/analyse/components/analyse';
import Editor from 'src/editor/components/editor';
import Play from 'src/play/components/play';
import NotFound from './notfound';

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route index element={<Analyse />} />
          <Route path="analysis" element={<Analyse />} />
          <Route path="editor" element={<Editor />} />
          <Route path="play" element={<Play />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
