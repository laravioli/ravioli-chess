import { usePageStore } from 'src/main/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { NativeSelect } from '@mantine/core';
import classes from '../../css/controls.module.css';
import type { EditorStore } from 'src/editor/store/editor';

export const TurnToPlay = observer(() => {
  const editorStore = usePageStore<EditorStore>();

  const data = [
    { label: 'White to play', value: 'white' },
    { label: 'Black to play', value: 'black' },
  ];

  return (
    <NativeSelect
      value={editorStore.fen.turn}
      onChange={event => {
        editorStore.fen.setTurn(event.target.value as Color);
      }}
      data={data}
      classNames={{ input: classes.select }}
    />
  );
});
