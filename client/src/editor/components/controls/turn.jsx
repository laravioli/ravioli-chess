import { useModule } from 'src/shared/hooks/hooks';
import { useSnapshot } from 'valtio';
import { NativeSelect } from '@mantine/core';
import classes from '../css/controls.module.css';

export const TurnToPlay = () => {
  const editor = useModule();
  const snap = useSnapshot(editor);

  const data = [
    { label: 'White to play', value: 'w' },
    { label: 'Black to play', value: 'b' },
  ];

  const onChange = () => {
    editor.fen.setTurn();
  };

  return (
    <NativeSelect
      value={snap.fen.turn}
      onChange={onChange}
      data={data}
      classNames={{ wrapper: classes.wrapper }}
    />
  );
};
