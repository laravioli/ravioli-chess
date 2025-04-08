import { useModule, useMainStore } from 'src/shared/hooks/hooks';
import { NativeSelect } from '@mantine/core';
import styles from '../css/controls.module.css';

export const TurnToPlay = () => {
  const editor = useModule();
  const turn = useMainStore((state) => state.fen.turn);
  const data = [
    { label: 'White to play', value: 'w' },
    { label: 'Black to play', value: 'b' },
  ];

  const onChange = () => {
    editor.fen.setTurn();
  };

  return (
    <NativeSelect
      value={turn}
      onChange={onChange}
      data={data}
      classNames={{ wrapper: styles.wrapper }}
    />
  );
};
