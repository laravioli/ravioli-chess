import { useState, type Dispatch, type SetStateAction } from 'react';

export type MenuViewFC = React.FC<{
  navigate: Dispatch<SetStateAction<MenuViewKey>>;
}> & {
  subMenus?: Record<string, MenuViewFC>;
};

type MenuViewKey = string;

export const useMenu = (menuViews: Record<MenuViewKey, MenuViewFC> & { main: MenuViewFC }) => {
  const [view, setView] = useState<MenuViewKey>('main');

  const CurrentView = menuViews[view];

  return {
    currentMenu: <CurrentView navigate={setView} />,
    navigate: setView,
  };
};
