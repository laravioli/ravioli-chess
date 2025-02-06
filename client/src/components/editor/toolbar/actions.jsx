import { Button, NativeSelect } from '@mantine/core';
import styles from './toolbar.module.css';
import { History } from './history';
import { chess } from '../../../stores/gamestore';
import { useState, useMemo, useEffect } from 'react';
import { useBoundStore } from '../../../stores/hooks/useboundstore';
import { useInitData } from '../../../context';
import { short_fen } from './utils';

export function EditorActions() {
  //test purpose
  const boardApi = useBoundStore((state) => state.boardApi);

  const test = () => {
    console.log('board ' + boardApi.getBoardFen());
    console.log('chess ' + chess.fen());
    console.log('fen ' + useBoundStore.getState().fen());
    console.log(chess.history());
  };

  //endtest

  return (
    <>
      <Position />
      <Button.Group orientation="vertical" classNames={{ group: styles.group }}>
        <StartButton />
        <ClearButton />
        <FlipButton />
        <ContinueEditButton />
        <TestButton label="position" onTest={test} />
      </Button.Group>
      <History />
    </>
  );
}

const EditorButton = ({ label, onClick = () => {}, isDisabled = false }) => {
  return (
    <Button
      variant="filled"
      color="rgba(56, 56, 56, 0.85)"
      size="md"
      radius="xs"
      onClick={onClick}
      disabled={isDisabled}>
      {label}
    </Button>
  );
};

export const Position = () => {
  const position = useInitData();
  const [value, setValue] = useState('');
  const setFen = useBoundStore((state) => state.setFenSliceFromInput);
  const gameActions = useBoundStore((state) => state.gameActions);

  const data = useMemo(
    () => [
      { label: 'select position', value: '' },
      ...position.map((obj) => ({
        label: [obj.eco, obj.name].join(' '),
        value: obj.fen,
      })),
    ],
    [position]
  );

  const fens = useMemo(() => data.map((obj) => short_fen(obj.value)), [data]);

  useEffect(() => {
    const unsub = useBoundStore.subscribe(
      (state) => state.fen(),
      (fen) => {
        const match = fens.findIndex((pos) => pos === short_fen(fen));
        if (match > 0) {
          setValue(data[match].value);
        } else {
          setValue(data[0].value);
        }
      }
    );
    return unsub;
  }, [fens, data]);

  const onChange = (event) => {
    const fen = event.currentTarget.value;
    if (fen && fen != useBoundStore.getState().fen()) {
      setFen(fen);
      gameActions.newGame({ mode: useBoundStore.getState().mode });
    } else {
      setValue(fen);
    }
  };

  return (
    <NativeSelect
      value={value}
      onChange={onChange}
      data={data}
      classNames={{ wrapper: styles.wrapper }}
    />
  );
};

export const StartButton = () => {
  const boardApi = useBoundStore((state) => state.boardApi);
  const resetFen = useBoundStore((state) => state.resetFen);
  const gameActions = useBoundStore((state) => state.gameActions);

  const onStart = () => {
    boardApi.startBoard();
    resetFen(true);
    gameActions.newGame({ mode: useBoundStore.getState().mode });
  };

  return <EditorButton label="starting position" onClick={onStart} />;
};

export const ClearButton = () => {
  const mode = useBoundStore((state) => state.mode);
  const boardApi = useBoundStore((state) => state.boardApi);
  const resetFen = useBoundStore((state) => state.resetFen);

  const onClear = () => {
    boardApi.clearBoard();
    resetFen(false);
  };

  return (
    <EditorButton
      label="clear board"
      onClick={onClear}
      isDisabled={mode !== 'editor'}
    />
  );
};

export const FlipButton = () => {
  const boardApi = useBoundStore((state) => state.boardApi);

  const onFlip = () => boardApi.flipBoard();

  return <EditorButton label="flip board" onClick={onFlip} />;
};

export const ContinueEditButton = () => {
  const [isEdit, setIsEdit] = useState(false);
  const isLegalFen = useBoundStore((state) => state.isLegalFen);
  const setFenSliceContinue = useBoundStore(
    (state) => state.setFenSliceContinue
  );
  const dispatchConf = useBoundStore((state) => state.dispatchConf);
  const newGame = useBoundStore((state) => state.gameActions.newGame);

  const label = isEdit ? 'continue from here' : 'edit position';

  const onClick = () => {
    if (setFenSliceContinue()) {
      dispatchConf({ mode: isEdit ? 'continue' : 'editor' });
      newGame({ mode: isEdit ? 'continue' : 'editor' });
      setIsEdit(!isEdit);
    }
  };

  return (
    <EditorButton
      label={label}
      onClick={onClick}
      isDisabled={isEdit && !isLegalFen}
    />
  );
};

export const TestButton = ({ label, onTest }) => {
  return <EditorButton label={label} onClick={onTest} />;
};
