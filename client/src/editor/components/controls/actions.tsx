import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import clsx from 'clsx';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import { INITIAL_FEN } from 'chessops/fen';
import { EMPTY_FEN } from 'chessops/fen';
import { IconMathMaxMin, IconReload, IconRepeat, IconTrash } from '@tabler/icons-react';

import { usePageStore } from '@/core/hooks/hooks';
import { ToolTipConfigProvider } from '@/common/components/controls/tooltip';
import { ActionWithToolTip } from '@/common/components/controls/action';

import layout from '@/editor/css/layout.module.css';
import classes from '@/editor/css/controls.module.css';
import type { EditorStore } from '@/editor/store/editor';
import type { EditorOpts } from '@/editor/store/interface';

export const Actions: React.FC = () => {
  return (
    <div className={clsx(layout.actions, classes.actions)}>
      <ToolTipConfigProvider value={{ position: 'right' }}>
        <BoardControls />
        <Navigate />
      </ToolTipConfigProvider>
    </div>
  );
};

const BoardControls: React.FC = () => {
  const store = usePageStore<EditorStore>();
  const actions = useMemo(
    () => [
      {
        key: 'flip',
        label: 'flip board',
        onClick: () => store.flip(),
        icon: (
          <IconRepeat
            size={40}
            stroke={1.2}
          />
        ),
      },
      {
        key: 'start',
        label: 'reset board',
        onClick: () => store.setFen(INITIAL_FEN),
        icon: (
          <IconReload
            size={40}
            stroke={1.2}
          />
        ),
      },
      {
        key: 'clear',
        label: 'clear board',
        onClick: () => store.setFen(EMPTY_FEN),
        icon: (
          <IconTrash
            size={40}
            stroke={1.2}
          />
        ),
      },
    ],
    [],
  );

  return (
    <>
      {actions.map((action) => (
        <ActionWithToolTip
          key={action.key}
          className={classes.button}
          label={action.label}
          onClick={action.onClick}
        >
          {action.icon}
        </ActionWithToolTip>
      ))}
    </>
  );
};

const Navigate: React.FC = observer(() => {
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
    <ActionWithToolTip
      className={classes.button}
      label={'analysis board'}
      onClick={onClick}
      disabled={!store.fen.legalFen}
    >
      <IconMathMaxMin
        size={30}
        stroke={1.2}
      />
    </ActionWithToolTip>
  );
});
