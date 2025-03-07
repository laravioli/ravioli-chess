import { Checkbox } from '@mantine/core';
import styles from './fen.module.css';
import { useBoundStore } from 'src/stores/hooks/useboundstore';

export const CastlingBoxes = () => {
  const mode = useBoundStore((state) => state.mode);
  const disabled = mode !== 'editor';

  return (
    <>
      <strong>castling</strong>
      <div className={styles.castle}>
        <CastlingBox id="K" label="O-O" disabled={disabled} />
        <CastlingBox id="Q" label="O-O-O" disabled={disabled} />
        <CastlingBox id="k" label="o-o" disabled={disabled} />
        <CastlingBox id="q" label="o-o-o" disabled={disabled} />
      </div>
    </>
  );
};

const CastlingBox = ({ id, label, disabled }) => {
  const castlingRight = useBoundStore((state) => state.castling[id]);
  const setCastlingRight = useBoundStore((state) => state.setCastlingRight);

  const onChange = () => {
    setCastlingRight(id, !castlingRight);
  };

  return (
    <Checkbox
      checked={castlingRight}
      label={label}
      color="gray"
      variant="outline"
      radius="xs"
      onChange={onChange}
      disabled={disabled}
    />
  );
};
