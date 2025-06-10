import { Shell } from 'src/common/components/appshell/appshell';
import { BrowserRouter, Routes, Route } from 'react-router';
import { lazy, Suspense } from 'react';

const Analyse = lazy(() => import('src/analyse/components/page/analyse'));
const Editor = lazy(() => import('src/editor/components/page/editor'));
const Play = lazy(() => import('src/play/components/page/play'));
const NotFound = lazy(() => import('./notfound'));

export const Router = () => {
  return (
    <BrowserRouter>
      <Suspense>
        <Routes>
          <Route path="/" element={<Shell />}>
            <Route index element={<Analyse />} />
            <Route path="analysis" element={<Analyse />} />
            <Route path="editor" element={<Editor />} />
            <Route path="play" element={<Play />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
