import { BrowserRouter, Routes, Route } from 'react-router';
import { ModuleProvider } from 'src/shared/context/provider';
import { Analyse } from 'src/analyse/components/page/analyse';
import { Editor } from 'src/editor/components/page/editor';
import { NotFound } from './notfound';

export const Router = () => {
  return (
    <BrowserRouter>
      <ModuleProvider>
        <Routes>
          {['/', 'analysis'].map((path, index) => {
            return <Route path={path} element={<Analyse />} key={index} />;
          })}
          <Route path="editor" element={<Editor />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ModuleProvider>
    </BrowserRouter>
  );
};
