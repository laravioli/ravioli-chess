import { usePageStore } from 'src/main/hooks/hooks';
import { INITIAL_FEN } from 'chessops/fen';
import { Group } from '@mantine/core';
import { FlipButton, StartButton } from 'src/common/components/controls/action';
import { Navigate } from 'src/common/components/navigation/navigate';
import { Positions } from './positions';
import { ToolTipConfigProvider } from 'src/common/components/controls/tooltip';
import type { AnalyseStore } from 'src/analyse/store/analyse';

export const Actions = () => {
  const store = usePageStore<AnalyseStore>();

  return (
    <Group justify="center">
      <ToolTipConfigProvider value={{ position: 'bottom' }}>
        <FlipButton />
        <StartButton onClick={() => store.reload(INITIAL_FEN)} />
        <Positions />
        <Navigate path="/editor" getFen={() => store.node?.fen || INITIAL_FEN} />
      </ToolTipConfigProvider>
    </Group>
  );
};
