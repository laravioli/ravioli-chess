import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import { usePageStore } from 'src/main/hooks/hooks';
import { useNavigate } from 'react-router';
import { useMemo } from 'react';
import { ToolTipConfigProvider } from 'src/common/components/controls/tooltip';
import { Action } from 'src/common/components/controls/action';
import { IconMathMaxMin, IconReload, IconRepeat, IconTrash } from '@tabler/icons-react';
import { INITIAL_FEN } from 'chessops/fen';
import { EMPTY_FEN } from 'chessops/fen';
import clsx from 'clsx';
import layout from '../../css/layout.module.css';
import classes from '../../css/controls.module.css';
import type { EditorStore } from 'src/editor/store/editor';
import type { EditorOpts } from 'src/editor/store/interface';

export const Actions = () => {
  return (
    <div className={clsx(layout.actions, classes.actions)}>
      <ToolTipConfigProvider value={{ position: 'right' }}>
        <BoardControls />
        <Navigate />
      </ToolTipConfigProvider>
    </div>
  );
};

const BoardControls = () => {
  const store = usePageStore<EditorStore>();
  const actions = useMemo(
    () => [
      {
        key: 'flip',
        label: 'flip board',
        onClick: () => store.flip(),
        icon: <IconRepeat size={40} stroke={1.2} />,
      },
      {
        key: 'start',
        label: 'reset board',
        onClick: () => store.setFen(INITIAL_FEN),
        icon: <IconReload size={40} stroke={1.2} />,
      },
      {
        key: 'clear',
        label: 'clear board',
        onClick: () => store.setFen(EMPTY_FEN),
        icon: <IconTrash size={40} stroke={1.2} />,
      },
    ],
    [],
  );

  return (
    <>
      {actions.map(action => (
        <Action key={action.key} className={classes.button} label={action.label} onClick={action.onClick}>
          {action.icon}
        </Action>
      ))}
    </>
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
    <Action
      className={classes.button}
      label={'analysis board'}
      onClick={onClick}
      disabled={!store.fen.legalFen}
    >
      <IconMathMaxMin size={30} stroke={1.2} />
    </Action>
  );
});
