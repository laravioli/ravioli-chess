import { mainStore } from 'src/main/store';
import { useRef, useEffect } from 'react';
import { useModule, useMainStore } from 'src/shared/hooks/hooks';
import { TextInput } from '@mantine/core';
import styles from '../css/fen.module.css';

export const FenInput = () => {
  const module = useModule();
  const setFen = useMainStore((state) => state.setFen);
  const inputRef = useRef(null);

  useEffect(() => {
    mainStore.setState({ fenInputRef: inputRef });
    const unsub = mainStore.subscribe(
      (state) => state.fen(),
      (fen) => {
        inputRef.current.value = fen;
      },
      {
        fireImmediately: true,
      }
    );
    return unsub;
  }, []);

  const onKeyDown = (event) => {
    if (event.key === 'Enter') {
      const fen = inputRef.current.value;
      setFen(fen);
      module.getBoard().position(mainStore.getState().fen(), true);
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
      classNames={{ input: styles.input }}
    />
  );
};
