import { NativeSelect } from '@mantine/core';
import styles from './fen.module.css';
import { useState, useEffect } from 'react';
import { mainStore, useMainStore } from 'src/stores';
import { controller } from 'src/logic';

export const TurnToPlay = () => {
  const [value, setValue] = useState('w');
  const setTurn = useMainStore((state) => state.setTurn);
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
      disabled={controller.mode !== 'editor'}
    />
  );
};
