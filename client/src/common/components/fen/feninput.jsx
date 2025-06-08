import { useRef, useEffect } from 'react';
import { usePageStore } from 'src/main/hooks/hooks';
import { useStore } from 'src/main/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { autorun } from 'mobx';
import { TextInput } from '@mantine/core';
import classes from './fen.module.css';

export const FenInput = observer(() => {
  const store = usePageStore();
  const { fenStore } = useStore();
  const inputRef = useRef(null);

  useEffect(() => {
    fenStore.inputRef.current = inputRef.current;
    inputRef.current.value = fenStore.current;

    const disposer = autorun(() => {
      if (inputRef.current) {
        inputRef.current.value = fenStore.current;
      }
    });
    return disposer;
  }, []);

  const onKeyDown = (event) => {
    if (event.key === 'Enter') {
      const fen = inputRef.current.value;
      fenStore.setFromInput(fen);
      store.board.position(fenStore.current, true);
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
      disabled={!!store.game}
      classNames={{ root: classes.root, input: classes.input }}
    />
  );
});
