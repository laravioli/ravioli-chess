import { useState, type Dispatch, type SetStateAction } from 'react';

export type MenuViewFC = React.FC<{
  navigate: Dispatch<SetStateAction<MenuViewKey>>;
  setOpened?: (value: React.SetStateAction<boolean>) => void;
}> & {
  subMenus?: Record<string, MenuViewFC>;
};

type MenuViewKey = string;

export const useMenu = (
  menuViews: Record<MenuViewKey, MenuViewFC> & { main: MenuViewFC },
  setOpened: (value: React.SetStateAction<boolean>) => void,
) => {
  const [view, setView] = useState<MenuViewKey>('main');

  const CurrentView = menuViews[view];

  return {
    currentMenu: <CurrentView navigate={setView} setOpened={setOpened} />,
    navigate: setView,
  };
};
