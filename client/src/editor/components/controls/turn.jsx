import { useStore } from 'src/main/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { NativeSelect } from '@mantine/core';
import classes from '../css/controls.module.css';

export const TurnToPlay = observer(() => {
  const { fenStore } = useStore();

  const data = [
    { label: 'White to play', value: 'w' },
    { label: 'Black to play', value: 'b' },
  ];

  const onChange = () => {
    fenStore.setTurn();
  };

  return (
    <NativeSelect
      value={fenStore.turn}
      onChange={onChange}
      data={data}
      classNames={{ wrapper: classes.wrapper }}
    />
  );
});
