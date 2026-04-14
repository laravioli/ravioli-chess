import {
  localStorageColorSchemeManager,
  createTheme,
  NativeSelect,
  type MantineProviderProps,
} from '@mantine/core';
import { QueryClient } from '@tanstack/react-query';

import type { ServerPayload, ProvidedData } from '@/core/boot/interface';
import { makeGlobalStore, type GlobalStore } from '@/core/store/stores';

/* App config */

export interface AppDependencies {
  mantineConfig: MantineProviderProps;
  data: ProvidedData;
  queryClient: QueryClient;
  globalStore: GlobalStore;
}

export const makeAppDependencies = (payload: ServerPayload): AppDependencies => {
  const queryClient = makeQueryClient();
  return {
    mantineConfig: makeMantineConfig(),
    data: { page: payload.page, data: payload.data },
    queryClient,
    globalStore: makeGlobalStore({
      userConfig: payload.user,
      queryClient,
    }),
  };
};

/* Mantine config */

const makeMantineConfig = (): MantineProviderProps => {
  const localstorageScheme = localStorageColorSchemeManager({
    key: 'color-scheme',
  });

  return {
    theme: createTheme({
      fontFamily: 'Arial',
      fontFamilyMonospace: 'Courier New, monospace',

      headings: {
        fontFamily: 'Georgia, serif',
      },
      primaryShade: { light: 6, dark: 7 },
      primaryColor: 'cyan',
      defaultRadius: 'lg',
      cursorType: 'pointer',
      components: {
        NativeSelect: NativeSelect.extend({
          vars: (_theme, _prop) => ({
            wrapper: {
              '--input-bd-focus': 'var(--input-bd)',
            },
          }),
        }),
      },
    }),
    withStaticClasses: false,
    colorSchemeManager: localstorageScheme,
    defaultColorScheme: 'dark',
  };
};

/* Tanstack query client */

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
      },
    },
  });
