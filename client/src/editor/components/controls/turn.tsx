import { observer } from 'mobx-react-lite';
import { NativeSelect } from '@mantine/core';

import { usePageStore } from '@/core/hooks/hooks';

import type { EditorStore } from '@/editor/store/editor';
import classes from '@/editor/css/controls.module.css';

export const TurnToPlay: React.FC = observer(() => {
  const editorStore = usePageStore<EditorStore>();

  const data = [
    { label: 'White to play', value: 'white' },
    { label: 'Black to play', value: 'black' },
  ];

  return (
    <NativeSelect
      value={editorStore.fen.turn}
      onChange={(event) => {
        editorStore.fen.setTurn(event.target.value as Color);
      }}
      data={data}
      classNames={{ input: classes.select }}
    />
  );
});
