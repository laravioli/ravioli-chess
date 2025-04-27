import { useNavigate } from 'react-router';
import { useStore } from 'src/main/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { Action } from './action';
import { IconMathMaxMin, IconEdit } from '@tabler/icons-react';

export const Navigate = observer(({ path, prev, next }) => {
  const { fenStore } = useStore();
  const navigate = useNavigate();
  const isEdit = path !== '/editor';
  const label = isEdit ? 'analysis board' : 'edit board';
  const Icon = isEdit ? IconMathMaxMin : IconEdit;

  const onClick = () => {
    if (fenStore.isAnalysable()) {
      prev.onUnLoad();
      next.onLoad();
      navigate(path, { replace: true });
    } else {
      prev.board.position(fenStore.current);
    }
  };

  return (
    <Action
      label={label}
      onClick={onClick}
      disabled={isEdit && !fenStore.isLegal}>
      <Icon size={30} stroke={1.2} />
    </Action>
  );
});
