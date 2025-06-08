import { useStore } from 'src/main/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { Checkbox } from '@mantine/core';
import classes from './controls.module.css';

export const CastlingBoxes = () => {
  return (
    <>
      <strong>castling</strong>
      <div className={classes.castle}>
        <CastlingBox id="K" label="O-O" />
        <CastlingBox id="Q" label="O-O-O" />
        <CastlingBox id="k" label="o-o" />
        <CastlingBox id="q" label="o-o-o" />
      </div>
    </>
  );
};

const CastlingBox = observer(({ id, label }) => {
  const { fenStore } = useStore();
  const castlingRight = fenStore.castling[id];

  const onChange = () => {
    fenStore.setCastlingRight(id, !castlingRight);
  };

  return (
    <Checkbox
      checked={castlingRight}
      label={label}
      color="gray"
      variant="outline"
      radius="xs"
      onChange={onChange}
    />
  );
});
