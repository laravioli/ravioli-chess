import { useRef, useEffect } from 'react';
import { autorun, action } from 'mobx';
import { observer } from 'mobx-react-lite';
import { TextInput } from '@mantine/core';

import { usePageStore } from '@/core/hooks/hooks';
import classes from '@/common/css/fen.module.css';

import type { EditorStore } from '@/editor/store/editor';

export const FenInput: React.FC = observer(() => {
  const pageStore = usePageStore<EditorStore>();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current!.value = pageStore.fen.current;

    return autorun(() => {
      if (inputRef.current) {
        inputRef.current.value = pageStore.fen.current;
      }
    });
  }, []);

  const onKeyDown = action((event) => {
    if (event.key === 'Enter') {
      inputRef.current!.blur();
    }
  });

  const onBlur = action(() => {
    const fen = inputRef.current!.value;
    if (fen !== pageStore.fen.current && pageStore.fen.isValid(fen)) {
      pageStore.setFen(fen);
    } else {
      inputRef.current!.value = pageStore.fen.current;
    }
  });

  return (
    <TextInput
      ref={inputRef}
      leftSectionPointerEvents="none"
      leftSection={'FEN'}
      variant="filled"
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      classNames={{ root: classes.root, input: classes.input }}
    />
  );
});
