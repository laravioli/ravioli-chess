import { useStore } from 'src/main/hooks/hooks';
import classes from './tools.module.css';

export const UserStatus = () => {
  const { userStore } = useStore();
  return <div className={classes.user}>{userStore.username}</div>;
};
