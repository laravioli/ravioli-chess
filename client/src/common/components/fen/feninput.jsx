import { useRef, useEffect } from 'react';
import { usePageStore } from 'src/main/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { autorun } from 'mobx';
import { TextInput } from '@mantine/core';
import classes from './fen.module.css';

export const FenInput = observer(() => {
  const pageStore = usePageStore();
  const inputRef = useRef(null);

  useEffect(() => {
    pageStore.fen.inputRef.current = inputRef.current;
    inputRef.current.value = pageStore.fen.current;

    return autorun(() => {
      if (inputRef.current) {
        inputRef.current.value = pageStore.fen.current;
      }
    });
  }, []);

  const onKeyDown = (event) => {
    if (event.key === 'Enter') {
      const fen = inputRef.current.value;
      pageStore.fen.setFromInput(fen);
      pageStore.board.position(pageStore.fen.current, true);
    }
  };

  return (
    <TextInput
      ref={inputRef}
      className="copyables"
      leftSectionPointerEvents="none"
      leftSection="FEN"
      variant="filled"
      onKeyDown={onKeyDown}
      disabled={!!pageStore.game}
      classNames={{ root: classes.root, input: classes.input }}
    />
  );
});
