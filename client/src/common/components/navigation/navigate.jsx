import { storeRouter } from 'src/main/store/rootstore';
import { useStore, usePageStore } from 'src/main/hooks/hooks';
import { useNavigate } from 'react-router';
import { observer } from 'mobx-react-lite';
import { Action } from '../toolbar/action';
import { IconMathMaxMin, IconEdit } from '@tabler/icons-react';
import { useEffect } from 'react';
import { action } from 'mobx';

export const Navigate = observer(({ path }) => {
  const current = usePageStore();
  const { fenStore } = useStore();
  const navigate = useNavigate();
  const isEdit = path !== '/editor';
  const label = isEdit ? 'analysis board' : 'edit board';
  const Icon = isEdit ? IconMathMaxMin : IconEdit;

  const onClick = action(() => {
    if (fenStore.isAnalysable()) {
      navigate(path, {
        replace: true,
        state : {fen : }
      });
    } else {
      current.board.position(fenStore.current);
    }
  });

  return (
    <Action
      label={label}
      onClick={onClick}
      disabled={isEdit && !fenStore.isLegal}>
      <Icon size={30} stroke={1.2} />
    </Action>
  );
});
