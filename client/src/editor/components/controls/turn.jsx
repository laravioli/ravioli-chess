import { useModule, useMainStore } from 'src/shared/hooks/hooks';
import { NativeSelect } from '@mantine/core';
import styles from '../css/controls.module.css';

export const TurnToPlay = () => {
  const module = useModule();
  const turn = useMainStore((state) => state.turn);
  const setTurn = useMainStore((state) => state.setTurn);
  const data = [
    { label: 'White to play', value: 'w' },
    { label: 'Black to play', value: 'b' },
  ];

  const onChange = () => {
    setTurn();
  };

  return (
    <NativeSelect
      value={turn}
      onChange={onChange}
      data={data}
      classNames={{ wrapper: styles.wrapper }}
      disabled={!!module.game}
    />
  );
};
