import { useStore } from "src/main/hooks/hooks";
import { observer } from "mobx-react-lite";
import classes from "../../css/tools.module.css";

export const UserStatus = observer(() => {
  const { userStore } = useStore();
  return <div className={classes.user}>{userStore.username}</div>;
});
