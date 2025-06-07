try {
  var _colorScheme = window.localStorage.getItem('color-scheme');
  var colorScheme =
    _colorScheme === 'light' ||
    _colorScheme === 'dark' ||
    _colorScheme === 'auto'
      ? _colorScheme
      : 'dark';
  var computedColorScheme =
    colorScheme !== 'auto'
      ? colorScheme
      : window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';

  document.documentElement.setAttribute(
    'data-mantine-color-scheme',
    computedColorScheme
  );
} catch (e) {}
