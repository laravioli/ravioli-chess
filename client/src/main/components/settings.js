import { localStorageColorSchemeManager, createTheme } from '@mantine/core';

export const MantineSettings = {
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
  }),
  withStaticClasses: false,
  colorSchemeManager: localStorageColorSchemeManager({
    key: 'color-scheme',
  }),
  defaultColorScheme: 'dark',
};
