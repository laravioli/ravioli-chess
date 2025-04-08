import { useModule } from 'src/shared/hooks/hooks';
import { CButton } from 'src/shared/components/toolbar/button';

export const ClearButton = () => {
  const editor = useModule();

  const onClear = () => {
    editor.getBoard().clear();
    editor.fen.resetFen(false);
  };

  return <CButton label={'clear board'} onClick={onClear} />;
};
