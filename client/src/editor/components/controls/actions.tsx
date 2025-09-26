import { usePageStore } from 'src/main/hooks/hooks';
import { ToolTipConfigProvider } from 'src/common/components/controls/tooltip';
import { INITIAL_FEN } from 'chessops/fen';
import { Action } from 'src/common/components/controls/action';
import { FlipButton, StartButton } from 'src/common/components/controls/action';
import { Navigate } from 'src/common/components/navigation/navigate';
import { IconTrash } from '@tabler/icons-react';
import { EMPTY_FEN } from 'chessops/fen';
import classes from '../../css/side.module.css';
import type { EditorStore } from 'src/editor/store/editor';

export const Actions = () => {
  const store = usePageStore<EditorStore>();

  return (
    <div className={classes.actions}>
      <ToolTipConfigProvider value={{ position: 'right' }}>
        <FlipButton />
        <StartButton onClick={() => store.setFen(INITIAL_FEN)} />
        <ClearButton />
        <Navigate path="/analysis" getFen={() => store.fen.current || INITIAL_FEN} />
      </ToolTipConfigProvider>
    </div>
  );
};

const ClearButton = () => {
  const editorStore = usePageStore<EditorStore>();
  return (
    <Action label="clear board" onClick={() => editorStore.setFen(EMPTY_FEN)}>
      <IconTrash size={40} stroke={1.2} />
    </Action>
  );
};
