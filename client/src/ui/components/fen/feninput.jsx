import { TextInput } from '@mantine/core';
import styles from './fen.module.css';
import { useRef, useEffect } from 'react';
import { mainStore, useMainStore } from 'src/stores';
import { getModule } from 'src/logic';

export const FenInput = () => {
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
      getModule().getBoard().position(mainStore.getState().fen(), true);
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
      disabled={getModule().name !== 'editor'}
      classNames={{ input: styles.input }}
    />
  );
};
