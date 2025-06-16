import { usePageStore } from 'src/main/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { NativeSelect } from '@mantine/core';

export const TurnToPlay = observer(() => {
  const pageStore = usePageStore();

  const data = [
    { label: 'White to play', value: 'w' },
    { label: 'Black to play', value: 'b' },
  ];

  const onChange = () => {
    pageStore.fen.setTurn();
  };

  return (
    <NativeSelect value={pageStore.fen.turn} onChange={onChange} data={data} />
  );
});
