import { useModule, useMainStore } from 'src/shared/hooks/hooks';
import { Checkbox } from '@mantine/core';
import styles from '../css/controls.module.css';

export const CastlingBoxes = () => {
  return (
    <>
      <strong>castling</strong>
      <div className={styles.castle}>
        <CastlingBox id="K" label="O-O" />
        <CastlingBox id="Q" label="O-O-O" />
        <CastlingBox id="k" label="o-o" />
        <CastlingBox id="q" label="o-o-o" />
      </div>
    </>
  );
};

const CastlingBox = ({ id, label }) => {
  const editor = useModule();
  const castlingRight = useMainStore((state) => state.fen.castling[id]);

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
};
