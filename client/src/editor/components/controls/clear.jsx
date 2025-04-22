import { useModule } from 'src/shared/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { Action } from 'src/shared/components/toolbar/action';
import { IconTrash } from '@tabler/icons-react';

export const ClearButton = observer(() => {
  const editor = useModule();

  const onClear = () => {
    editor.board.clear();
    editor.fen.resetFen(false);
  };

  return (
    <Action label="clear board" onClick={onClear}>
      <IconTrash size={40} stroke={1.5} />
    </Action>
  );
});
