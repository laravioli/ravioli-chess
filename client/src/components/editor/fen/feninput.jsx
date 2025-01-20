import { TextInput } from '@mantine/core';
import { useRef, useEffect } from 'react';
import { useBoundStore } from '../../../stores/hooks/useboundstore';
import { mode } from '../../../stores/controllerstore';

//todo : when user go to continue but didnt press enter on input => lichess behavior
//finish turn implementation and thats it

export const FenInput = () => {
  const fen = useBoundStore((state) => state.fen);
  const setFen = useBoundStore((state) => state.setFen);
  const currentMode = useBoundStore((state) => state.currentMode);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.value = fen;
  }, [fen]);

  const onKeyDown = (event) => {
    if (event.key === 'Enter') {
      const isFenUpdated = setFen(inputRef.current.value, true);
      if (!isFenUpdated) {
        inputRef.current.value = fen;
      }
    }
  };

  return (
    <TextInput
      ref={inputRef}
      leftSectionPointerEvents="none"
      leftSection="FEN:"
      variant="filled"
      radius="xs"
      onKeyDown={onKeyDown}
      disabled={currentMode !== mode.editor}
    />
  );
};
