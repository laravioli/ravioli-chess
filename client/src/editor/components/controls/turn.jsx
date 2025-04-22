import { useModule } from 'src/shared/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { NativeSelect } from '@mantine/core';
import classes from '../css/controls.module.css';

export const TurnToPlay = observer(() => {
  const editor = useModule();

  const data = [
    { label: 'White to play', value: 'w' },
    { label: 'Black to play', value: 'b' },
  ];

  const onChange = () => {
    editor.fen.setTurn();
  };

  return (
    <NativeSelect
      value={editor.fen.turn}
      onChange={onChange}
      data={data}
      classNames={{ wrapper: classes.wrapper }}
    />
  );
});
