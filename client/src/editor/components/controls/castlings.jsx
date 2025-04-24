import { useModule } from 'src/common/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { Checkbox } from '@mantine/core';
import classes from '../css/controls.module.css';

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
  const editor = useModule();
  const castlingRight = editor.fen.castling[id];

  const onChange = () => {
    editor.fen.setCastlingRight(id, !castlingRight);
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
