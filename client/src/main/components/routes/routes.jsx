import { BrowserRouter, Routes, Route } from 'react-router';
import { Analyse } from 'src/analyse/components/page/analyse';
import { Editor } from 'src/editor/components/page/editor';
import { NotFound } from './notfound';

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        {['/', 'analysis'].map((path, index) => {
          return <Route path={path} element={<Analyse />} key={index} />;
        })}
        <Route path="editor" element={<Editor />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};
