import { observer } from 'mobx-react-lite';

import { useGlobalStore } from '@/core/hooks/hooks';

import classes from '@/play/css/tools.module.css';

export const UserStatus = observer(() => {
  const { userStore } = useGlobalStore();
  return <div className={classes.user}>{userStore.username}</div>;
});
