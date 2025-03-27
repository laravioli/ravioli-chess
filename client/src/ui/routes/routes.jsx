import { BrowserRouter, Routes, Route } from 'react-router';
import { ModuleProvider } from '../context/modules';
import { Analyse } from '../pages/analyse';
import { Editor } from '../pages/editor';

export const Router = () => {
  return (
    <BrowserRouter>
      <ModuleProvider>
        <Routes>
          {['/', 'analysis'].map((path, index) => {
            return <Route path={path} element={<Analyse />} key={index} />;
          })}
          <Route path="editor" element={<Editor />} />
        </Routes>
      </ModuleProvider>
    </BrowserRouter>
  );
};
