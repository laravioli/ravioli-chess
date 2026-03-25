import { createBrowserRouter } from 'react-router';
import { QueryClient } from '@tanstack/react-query';

import { Shell } from '@/shell/components/appshell';
import Analyse from '@/analyse/components/analyse';
import Editor from '@/editor/components/editor';
import Play from '@/play/components/play';
import NotFound from './notfound';
import Profile from '@/user/components/profile';

import { createLoader } from './loaders';

export const createRouter = (queryClient: QueryClient) => {
  const loader = createLoader(queryClient);

  return createBrowserRouter([
    {
      path: '/',
      element: <Shell />,
      HydrateFallback: () => null,
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
          loader: loader.profile,
        },
        { path: '*', element: <NotFound /> },
      ],
    },
  ]);
};
