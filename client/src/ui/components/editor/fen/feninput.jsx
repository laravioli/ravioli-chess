import { TextInput } from '@mantine/core';
import styles from './fen.module.css';
import { useRef, useEffect } from 'react';
import { useBoundStore } from '../../../../stores/hooks/useboundstore';

export const FenInput = () => {
  const setFenSliceFromInput = useBoundStore(
    (state) => state.setFenSliceFromInput
  );
  const mode = useBoundStore((state) => state.mode);
  const inputRef = useRef(null);

  useEffect(() => {
    useBoundStore.setState({ fenInputRef: inputRef });
    const unsub = useBoundStore.subscribe(
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
