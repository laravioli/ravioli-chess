import { NativeSelect } from '@mantine/core';
import styles from './fen.module.css';
import { mainStore, useMainStore } from 'src/stores';
import { useState, useEffect } from 'react';

export const TurnToPlay = () => {
  const [value, setValue] = useState('w');
  const setTurn = useMainStore((state) => state.setTurn);
  const mode = useMainStore((state) => state.mode);
  const data = [
    { label: 'White to play', value: 'w' },
    { label: 'Black to play', value: 'b' },
  ];

  useEffect(() => {
    const unsub = mainStore.subscribe(
      (state) => state.turn,
      (turn) => {
        setValue(turn);
      }
    );
    return unsub;
  }, []);

  const onChange = () => {
    setTurn();
  };

  return (
    <NativeSelect
      value={value}
      onChange={onChange}
      data={data}
      classNames={{ wrapper: styles.wrapper }}
      disabled={mode !== 'editor'}
    />
  );
};
