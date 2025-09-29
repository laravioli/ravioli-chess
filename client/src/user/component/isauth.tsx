import { observer } from 'mobx-react-lite';
import { useGlobalStore } from 'src/main/hooks/hooks';
import type { ReactNode } from 'react';

export const IsAuth = observer(({ children }: { children: ReactNode }) => {
  const { userStore } = useGlobalStore();
  return userStore.logged ? <>{children}</> : null;
});
