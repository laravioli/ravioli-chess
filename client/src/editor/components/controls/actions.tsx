import { usePageStore } from 'src/main/hooks/hooks';
import { INITIAL_FEN } from 'chessops/fen';
import { FlipButton } from 'src/common/components/controls/flip';
import { StartButton } from 'src/common/components/controls/start';
import { Navigate } from 'src/common/components/navigation/navigate';
import { ClearButton } from './clear';
import classes from '../../css/side.module.css';

export const Actions = () => {
  const actions = useActionConfigs();

  return (
    <div className={classes.actions}>
      {actions.map(action => (
        <action.Component key={action.key} {...action.props} />
      ))}
    </div>
  );
};

const useActionConfigs = () => {
  const store = usePageStore();
  const opts = { ttposition: 'right' };
  const handlers = {
    start: () => store.setFen(INITIAL_FEN),
    nav: () => store.fen.current || INITIAL_FEN,
  };

  return [
    { key: 'flip', Component: FlipButton, props: { ...opts } },
    {
      key: 'start',
      Component: StartButton,
      props: { ...opts, onClick: handlers.start },
    },
    { key: 'clear', Component: ClearButton, props: { ...opts } },

    {
      key: 'nav',
      Component: Navigate,
      props: { ...opts, getFen: handlers.nav, path: '/analysis' },
    },
  ];
};
