import { localStorageColorSchemeManager, createTheme } from '@mantine/core';

const localstorageScheme = localStorageColorSchemeManager({
  key: 'color-scheme',
});

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
  colorSchemeManager: localstorageScheme,
  defaultColorScheme: 'light',
};

localstorageScheme.set('light');
