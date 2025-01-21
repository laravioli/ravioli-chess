import { TextInput } from '@mantine/core';
import styles from './fen.module.css';
import { useRef, useEffect } from 'react';
import { useBoundStore } from '../../../stores/hooks/useboundstore';
import { mode } from '../../../stores/controllerstore';

export const FenInput = () => {
  const validateFen = useBoundStore((state) => state.validateFen);
  const currentMode = useBoundStore((state) => state.currentMode);
  const inputRef = useRef(null);

  if (!inputRef.current) {
    useBoundStore.setState({ fenInputRef: inputRef });
  }

  useEffect(() => {
    const unsub = useBoundStore.subscribe(
      (state) => state.fen,
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
      validateFen();
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
