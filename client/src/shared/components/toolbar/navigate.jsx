import { controller } from 'src/main/logic';
import { useNavigate } from 'react-router';
import { useModule } from 'src/shared/hooks/hooks';
import { useSnapshot } from 'valtio';
import { Action } from './action';
import { IconMathMaxMin, IconEdit } from '@tabler/icons-react';

export function Navigate({ path }) {
  const module = useModule();
  const snap = useSnapshot(module);
  const navigate = useNavigate();

  const isEdit = path !== '/editor';
  const label = isEdit ? 'analysis board' : 'edit board';
  const Icon = isEdit ? IconMathMaxMin : IconEdit;

  const onClick = () => {
    if (module.fen.isFenAnalysable()) {
      controller.setModule(path, module.fen.current);
      navigate(path, { replace: true });
    } else {
      module.board.position(module.fen.current);
    }
  };

  return (
    <Action
      label={label}
      onClick={onClick}
      disabled={isEdit && !snap.fen.isLegal}>
      <Icon size={30} stroke={1.2} />
    </Action>
  );
}
