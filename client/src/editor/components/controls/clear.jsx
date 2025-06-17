import { usePageStore } from 'src/main/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { Action } from 'src/common/components/toolbar/action';
import { IconTrash } from '@tabler/icons-react';

export const ClearButton = observer(() => {
  const editorStore = usePageStore();

  const onClear = () => {
    editorStore.board.clear();
    editorStore.fen.reset(false);
  };

  return (
    <Action label="clear board" onClick={onClear}>
      <IconTrash size={40} stroke={1.5} />
    </Action>
  );
});
