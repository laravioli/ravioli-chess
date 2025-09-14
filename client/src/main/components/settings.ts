import {
  localStorageColorSchemeManager,
  createTheme,
  NativeSelect,
  type MantineProviderProps,
} from '@mantine/core';

const localstorageScheme = localStorageColorSchemeManager({
  key: 'color-scheme',
});

export const MantineSettings: MantineProviderProps = {
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
