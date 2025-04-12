import { mainStore } from 'src/main/store';
import { useRef, useEffect } from 'react';
import { useModule } from 'src/shared/hooks/hooks';
import { TextInput } from '@mantine/core';
import classes from '../css/fen.module.css';

export const FenInput = () => {
  const module = useModule();
  const inputRef = useRef(null);

  useEffect(() => {
    module.fen.inputRef = inputRef;
    const unsub = mainStore.subscribe(
      (state) => state.fen.current(),
      (fen) => {
        inputRef.current.value = fen;
      },
      {
        fireImmediately: true,
      }
    );
    return unsub;
  }, [module]);

  const onKeyDown = (event) => {
    if (event.key === 'Enter') {
      const fen = inputRef.current.value;
      module.fen.setFenFromInput(fen);
      module.getBoard().position(module.fen.current, true);
    }
  };

  return (
    <TextInput
      ref={inputRef}
      className="copyables"
      leftSectionPointerEvents="none"
      leftSection="FEN"
      variant="filled"
      radius="xs"
      onKeyDown={onKeyDown}
      disabled={!!module.game}
      classNames={{ input: classes.input }}
    />
  );
};
