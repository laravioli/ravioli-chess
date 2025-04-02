import { useModule, useMainStore } from 'src/shared/hooks/hooks';
import { CButton } from 'src/shared/components/toolbar/button';

export const ClearButton = () => {
  const editor = useModule();
  const resetFen = useMainStore((state) => state.resetFen);

  const onClear = () => {
    editor.getBoard().clear();
    resetFen(false);
  };

  return <CButton label={'clear board'} onClick={onClear} />;
};
