import { BrowserRouter, Routes, Route } from 'react-router';
import { lazy, Suspense } from 'react';

const Analyse = lazy(() => import('src/analyse/components/page/analyse'));
const Editor = lazy(() => import('src/editor/components/page/editor'));
const NotFound = lazy(() => import('./notfound'));

export const Router = () => {
  return (
    <BrowserRouter>
      <Suspense>
        <Routes>
          {['/', 'analysis'].map((path, index) => {
            return <Route path={path} element={<Analyse />} key={index} />;
          })}
          <Route path="editor" element={<Editor />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
