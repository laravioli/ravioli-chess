import { Checkbox } from '@mantine/core';
import { useBoundStore } from '../../../stores/hooks/useboundstore';
import { mode } from '../../../stores/controllerstore';

export const CastlingBoxes = () => {
  const currentMode = useBoundStore((state) => state.currentMode);
  return (
    <>
      <CastlingBox id="K" label="O-O" currentMode={currentMode} />
      <CastlingBox id="Q" label="O-O-O" currentMode={currentMode} />
      <CastlingBox id="k" label="o-o" currentMode={currentMode} />
      <CastlingBox id="q" label="o-o-o" currentMode={currentMode} />
    </>
  );
};

const CastlingBox = ({ id, label, currentMode }) => {
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
      disabled={currentMode !== mode.editor}
    />
  );
};
