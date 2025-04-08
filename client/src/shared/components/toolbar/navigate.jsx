import { controller } from 'src/main/logic';
import { useNavigate } from 'react-router';
import { useModule, useMainStore } from 'src/shared/hooks/hooks';
import { CButton } from './button';

export function Navigate({ path }) {
  const module = useModule();
  const navigate = useNavigate();
  const isLegalFen = useMainStore((state) => state.fen.isLegal());

  const isEdit = path !== '/editor';
  const label = isEdit ? 'analysis board' : 'edit board';

  const onClick = () => {
    if (module.fen.isFenAnalysable()) {
      controller.setModule(path, module.fen.current());
      navigate(path, { replace: true });
    } else {
      module.getBoard().position(module.fen.current());
    }
  };

  return (
    <CButton
      label={label}
      onClick={onClick}
      isDisabled={isEdit && !isLegalFen}
      style={{ margin: '0px 0px 12px 0px' }}
    />
  );
}
