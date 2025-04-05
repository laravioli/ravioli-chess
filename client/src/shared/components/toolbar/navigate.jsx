import { controller } from 'src/main/logic';
import { mainStore } from 'src/main/store';
import { useNavigate } from 'react-router';
import { useModule, useMainStore } from 'src/shared/hooks/hooks';
import { CButton } from './button';

export function Navigate({ path }) {
  const module = useModule();
  const navigate = useNavigate();
  const isLegalFen = useMainStore((state) => state.isLegalFen());
  const isFenAnalysable = useMainStore((state) => state.isFenAnalysable);

  const isEdit = path !== '/editor';
  const label = isEdit ? 'analysis board' : 'edit board';

  const onClick = () => {
    if (isFenAnalysable()) {
      controller.setModule(path, mainStore.getState().fen());
      navigate(path, { replace: true });
    } else {
      module.getBoard().position(mainStore.getState().fen());
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
