import { Checkbox } from '@mantine/core';
import styles from './fen.module.css';
import { useBoundStore } from '../../../stores/hooks/useboundstore';
import { mode } from '../../../stores/controllerstore';

export const CastlingBoxes = () => {
  const currentMode = useBoundStore((state) => state.currentMode);
  return (
    <>
      <strong>castling</strong>
      <div className={styles.castle}>
        <CastlingBox id="K" label="O-O" currentMode={currentMode} />
        <CastlingBox id="Q" label="O-O-O" currentMode={currentMode} />
        <CastlingBox id="k" label="o-o" currentMode={currentMode} />
        <CastlingBox id="q" label="o-o-o" currentMode={currentMode} />
      </div>
    </>
  );
};

const CastlingBox = ({ id, label, currentMode }) => {
  const castlingRight = useBoundStore((state) => state.castling[id]);
  const setCastlingRights = useBoundStore((state) => state.setCastlingRights);

  const onChange = () => {
    setCastlingRights(id, !castlingRight);
  };

  return (
    <Checkbox
      checked={castlingRight}
      label={label}
      color="gray"
      variant="outline"
      radius="xs"
      onChange={onChange}
      disabled={currentMode !== mode.editor}
    />
  );
};
