import { usePageStore } from 'src/main/hooks/hooks';
import { INITIAL_FEN } from 'chessops/fen';
import { Group } from '@mantine/core';
import { FlipButton } from 'src/common/components/controls/flip';
import { StartButton } from 'src/common/components/controls/start';
import { Navigate } from 'src/common/components/navigation/navigate';
import { Positions } from './positions';

export const Actions = () => {
  const actions = useActionConfigs();

  return (
    <Group justify="center">
      {actions.map(action => (
        <action.Component key={action.key} {...action.props} />
      ))}
    </Group>
  );
};

const useActionConfigs = () => {
  const store = usePageStore();
  const opts = { ttposition: 'bottom' };
  const handlers = {
    start: () => store.reload(INITIAL_FEN),
    nav: () => store.node?.fen || INITIAL_FEN,
  };

  return [
    { key: 'flip', Component: FlipButton, props: { ...opts } },
    {
      key: 'start',
      Component: StartButton,
      props: { ...opts, onClick: handlers.start },
    },
    { key: 'pos', Component: Positions, props: { ...opts } },
    {
      key: 'nav',
      Component: Navigate,
      props: { ...opts, getFen: handlers.nav, path: '/editor' },
    },
  ];
};
