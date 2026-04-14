import { QueryClient } from '@tanstack/react-query';
import { getUserOptions } from '@/lib/api/@tanstack/react-query.gen';
import { type LoaderFunctionArgs } from 'react-router';

export const createLoader = (queryClient: QueryClient) => {
  return {
    profile: async ({ params }: LoaderFunctionArgs) => {
      const { username } = params;
      const data = await queryClient.fetchQuery({
        ...getUserOptions({ path: { username: username! } }),
        staleTime: 60 * 1000,
      });
      return data;
    },
  };
};
