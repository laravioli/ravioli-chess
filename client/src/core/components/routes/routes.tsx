import { Shell } from '@/shell/components/appshell';
import { BrowserRouter, Routes, Route } from 'react-router';

import Analyse from '@/analyse/components/analyse';
import Editor from '@/editor/components/editor';
import Play from '@/play/components/play';

import NotFound from './notfound';

export const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Shell />}
        >
          <Route
            index
            element={<Analyse />}
          />
          <Route
            path="analysis"
            element={<Analyse />}
          />
          <Route
            path="editor"
            element={<Editor />}
          />
          <Route
            path="play"
            element={<Play />}
          />
          <Route
            path="*"
            element={<NotFound />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
