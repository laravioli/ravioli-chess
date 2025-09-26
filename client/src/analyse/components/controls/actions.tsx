import { usePageStore } from 'src/main/hooks/hooks';
import { useNavigate } from 'react-router';
import { INITIAL_FEN } from 'chessops/fen';
import { Group } from '@mantine/core';
import { Action } from 'src/common/components/controls/action';
import { FlipButton, StartButton } from 'src/common/components/controls/action';
import { Positions } from './positions';
import { ToolTipConfigProvider } from 'src/common/components/controls/tooltip';
import type { AnalyseStore } from 'src/analyse/store/analyse';
import type { AnalyseOpts } from 'src/analyse/store/interface';
import { IconEdit } from '@tabler/icons-react';

export const Actions = () => {
  const store = usePageStore<AnalyseStore>();

  return (
    <Group justify="center">
      <ToolTipConfigProvider value={{ position: 'bottom' }}>
        <FlipButton />
        <StartButton onClick={() => store.reload(INITIAL_FEN)} />
        <Positions />
        <Navigate />
      </ToolTipConfigProvider>
    </Group>
  );
};

const Navigate = () => {
  const store = usePageStore<AnalyseStore>();
  const navigate = useNavigate();
  const getState = (): AnalyseOpts => ({ fen: store.node.fen, orientation: store.board!.state.orientation });
  return (
    <Action label={'edit board'} onClick={() => navigate('/editor', { replace: true, state: getState() })}>
      <IconEdit size={30} stroke={1.2} />
    </Action>
  );
};
