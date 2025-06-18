import { usePageStore } from 'src/main/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { NativeSelect } from '@mantine/core';

export const TurnToPlay = observer(() => {
  const editorStore = usePageStore();

  const data = [
    { label: 'White to play', value: 'w' },
    { label: 'Black to play', value: 'b' },
  ];

  const onChange = () => {
    editorStore.fen.setTurn();
  };

  return (
    <NativeSelect
      value={editorStore.fen.turn}
      onChange={onChange}
      data={data}
    />
  );
});
