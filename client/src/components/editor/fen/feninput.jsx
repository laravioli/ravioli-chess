import { TextInput } from '@mantine/core';
import styles from './fen.module.css';
import { useRef, useEffect } from 'react';
import { useBoundStore } from '../../../stores/hooks/useboundstore';
import { mode } from '../../../stores/controllerstore';

export const FenInput = () => {
  const setFenSliceFromInput = useBoundStore(
    (state) => state.setFenSliceFromInput
  );
  const currentMode = useBoundStore((state) => state.currentMode);
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
      setFenSliceFromInput();
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
      disabled={currentMode !== mode.editor}
      classNames={{ input: styles.input }}
    />
  );
};
