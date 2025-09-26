import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import { usePageStore } from 'src/main/hooks/hooks';
import { useNavigate } from 'react-router';
import { ToolTipConfigProvider } from 'src/common/components/controls/tooltip';
import { Action } from 'src/common/components/controls/action';
import { FlipButton, StartButton } from 'src/common/components/controls/action';
import { IconMathMaxMin, IconTrash } from '@tabler/icons-react';
import { INITIAL_FEN } from 'chessops/fen';
import { EMPTY_FEN } from 'chessops/fen';
import classes from '../../css/side.module.css';
import type { EditorStore } from 'src/editor/store/editor';
import type { EditorOpts } from 'src/editor/store/interface';

export const Actions = () => {
  const store = usePageStore<EditorStore>();

  return (
    <div className={classes.actions}>
      <ToolTipConfigProvider value={{ position: 'right' }}>
        <FlipButton />
        <StartButton onClick={() => store.setFen(INITIAL_FEN)} />
        <ClearButton />
        <Navigate />
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

const Navigate = observer(() => {
  const store = usePageStore<EditorStore>();
  const navigate = useNavigate();
  const getState = (): EditorOpts => ({
    fen: store.fen.current,
    orientation: store.board!.state.orientation,
  });
  const onClick = action(() => {
    if (store.fen.legalFen) navigate('/analysis', { replace: true, state: getState() });
  });
  return (
    <Action label={'analysis board'} onClick={onClick} disabled={!store.fen.legalFen}>
      <IconMathMaxMin size={30} stroke={1.2} />
    </Action>
  );
});
