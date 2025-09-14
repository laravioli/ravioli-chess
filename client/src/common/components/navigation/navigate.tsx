import { usePageStore } from 'src/main/hooks/hooks';
import { useNavigate } from 'react-router';
import { observer } from 'mobx-react-lite';
import { Action } from '../controls/action';
import { IconMathMaxMin, IconEdit } from '@tabler/icons-react';
import { action } from 'mobx';
import { INITIAL_FEN } from 'chessops/fen';

export const Navigate = observer(({ ttposition, path, getFen }) => {
  const pageStore = usePageStore();
  const navigate = useNavigate();
  const isEdit = path !== '/editor';
  const label = isEdit ? 'analysis board' : 'edit board';
  const Icon = isEdit ? IconMathMaxMin : IconEdit;
  const disabled = isEdit && !pageStore.fen.legalFen;

  const onClick = action(() => {
    if (!isEdit || pageStore.fen.legalFen) {
      navigate(path, {
        replace: true,
        state: { fen: getFen() || INITIAL_FEN, orientation: pageStore.board!.state.orientation },
      });
    }
  });

  return (
    <Action label={label} onClick={onClick} ttposition={ttposition} disabled={disabled}>
      <Icon size={30} stroke={1.2} />
    </Action>
  );
});
