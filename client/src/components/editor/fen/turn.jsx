import { NativeSelect } from '@mantine/core';
import styles from './fen.module.css';
import { useBoundStore } from '../../../stores/hooks/useboundstore';
import { mode } from '../../../stores/controllerstore';

export const TurnToPlay = () => {
  const turn = useBoundStore((state) => state.turn);
  const setTurn = useBoundStore((state) => state.setTurn);

  const currentMode = useBoundStore((state) => state.currentMode);
  const data = ['White to play', 'Black to play'];
  const value = turn === 'w' ? 0 : 1;

  const onChange = () => {
    setTurn();
  };

  return (
    <NativeSelect
      value={data[value]}
      onChange={onChange}
      data={data}
      classNames={{ wrapper: styles.wrapper }}
      disabled={currentMode !== mode.editor}
    />
  );
};
