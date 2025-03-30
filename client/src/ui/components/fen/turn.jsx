import { NativeSelect } from '@mantine/core';
import styles from './fen.module.css';
import { useMainStore } from 'src/stores';
import { useModule } from 'src/ui/context/hooks.js';

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
