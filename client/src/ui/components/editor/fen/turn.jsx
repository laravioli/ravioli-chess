import { NativeSelect } from '@mantine/core';
import styles from './fen.module.css';
import { useBoundStore } from 'src/stores/hooks/useboundstore';
import { useState, useEffect } from 'react';

export const TurnToPlay = () => {
  const [value, setValue] = useState('w');
  const setTurn = useBoundStore((state) => state.setTurn);
  const mode = useBoundStore((state) => state.mode);
  const data = [
    { label: 'White to play', value: 'w' },
    { label: 'Black to play', value: 'b' },
  ];

  useEffect(() => {
    const unsub = useBoundStore.subscribe(
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
