import { useModule } from 'src/shared/hooks/hooks';
import { Action } from 'src/shared/components/toolbar/action';
import { IconTrash } from '@tabler/icons-react';

export const ClearButton = () => {
  const editor = useModule();

  const onClear = () => {
    editor.getBoard().clear();
    editor.fen.resetFen(false);
  };

  return (
    <Action label="clear board" onClick={onClear}>
      <IconTrash size={40} stroke={1.5} />
    </Action>
  );
};
