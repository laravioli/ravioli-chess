import { createBrowserRouter } from 'react-router';

import { Shell } from '@/shell/components/appshell';
import Analyse from '@/analyse/components/analyse';
import Editor from '@/editor/components/editor';
import Play from '@/play/components/play';
import NotFound from './notfound';
import Profile from '@/user/component/profile';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Shell />,
    children: [
      {
        index: true,
        element: <Analyse />,
      },
      {
        path: 'analysis',
        element: <Analyse />,
      },
      {
        path: 'editor',
        element: <Editor />,
      },
      {
        path: 'play',
        element: <Play />,
      },
      {
        path: 'profile/:username',
        element: <Profile />,
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
