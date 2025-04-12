import { controller } from 'src/main/logic';
import { useNavigate } from 'react-router';
import { useModule, useMainStore } from 'src/shared/hooks/hooks';
import { Action } from './action';
import { IconMathMaxMin, IconEdit } from '@tabler/icons-react';

export function Navigate({ path }) {
  const module = useModule();
  const navigate = useNavigate();
  const isLegalFen = useMainStore((state) => state.fen.isLegal());

  const isEdit = path !== '/editor';
  const label = isEdit ? 'analysis board' : 'edit board';
  const Icon = isEdit ? IconMathMaxMin : IconEdit;

  const onClick = () => {
    if (module.fen.isFenAnalysable()) {
      controller.setModule(path, module.fen.current);
      navigate(path, { replace: true });
    } else {
      module.getBoard().position(module.fen.current);
    }
  };

  return (
    <Action label={label} onClick={onClick} disabled={isEdit && !isLegalFen}>
      <Icon size={30} stroke={1.2} />
    </Action>
  );
}
