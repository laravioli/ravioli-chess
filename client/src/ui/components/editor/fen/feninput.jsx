import { TextInput } from '@mantine/core';
import styles from './fen.module.css';
import { useRef, useEffect } from 'react';
import { mainStore, useMainStore } from 'src/stores';

export const FenInput = () => {
  const setFenSliceFromInput = useMainStore(
    (state) => state.setFenSliceFromInput
  );
  const mode = useMainStore((state) => state.mode);
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
      setFenSliceFromInput(inputRef.current.value);
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
      disabled={mode !== 'editor'}
      classNames={{ input: styles.input }}
    />
  );
};
