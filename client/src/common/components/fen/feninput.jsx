import { useRef, useEffect } from 'react';
import { useModule } from 'src/common/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { autorun } from 'mobx';
import { TextInput } from '@mantine/core';
import classes from '../css/fen.module.css';

export const FenInput = observer(() => {
  const module = useModule();
  const inputRef = useRef(null);

  useEffect(() => {
    module.fen.inputRef.current = inputRef.current;
    inputRef.current.value = module.fen.current;

    const disposer = autorun(() => {
      if (inputRef.current) {
        inputRef.current.value = module.fen.current;
      }
    });
    return disposer;
  }, [module]);

  const onKeyDown = (event) => {
    if (event.key === 'Enter') {
      const fen = inputRef.current.value;
      module.fen.setFenFromInput(fen);
      module.board.position(module.fen.current, true);
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
});
