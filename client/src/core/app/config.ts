import {
  localStorageColorSchemeManager,
  createTheme,
  NativeSelect,
  type MantineProviderProps,
} from '@mantine/core';
import type { QueryClientConfig } from '@tanstack/react-query';

const mantineConfig = (): MantineProviderProps => {
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

const queryConfig = (): QueryClientConfig => ({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});

export const CONFIG = { mantine: mantineConfig(), queryClient: queryConfig() };
