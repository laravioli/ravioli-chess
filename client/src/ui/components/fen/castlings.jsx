import { Checkbox } from '@mantine/core';
import styles from './fen.module.css';
import { useMainStore } from 'src/stores';
import { getModule } from 'src/logic';

export const CastlingBoxes = () => {
  const disabled = getModule().name !== 'editor';

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
  const castlingRight = useMainStore((state) => state.castling[id]);
  const setCastlingRight = useMainStore((state) => state.setCastlingRight);

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
