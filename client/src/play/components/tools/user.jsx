import { useStore } from 'src/main/hooks/hooks';
import classes from './tools.module.css';

export const UserStatus = () => {
  const { uiStore } = useStore();
  return <div className={classes.user}>{uiStore.name}</div>;
};
