import { Button, NativeSelect } from '@mantine/core';
import styles from './toolbar.module.css';
import { History } from './history';
import { useState, useMemo, useEffect } from 'react';
import { mainStore, useMainStore, useEvalStore } from 'src/stores';
import { useInitData } from 'src/ui/context';
import { short_fen } from './utils';

export function EditorActions() {
  //test purpose
  const boardApi = useMainStore((state) => state.boardApi);
  const gameApi = useMainStore((state) => state.gameApi);
  const toggle = useEvalStore((state) => state.toggle);

  const test = () => {
    console.log('board ' + boardApi.getBoardFen());
    console.log('chess ' + gameApi.game()?.fen());
    console.log('fen ' + mainStore.getState().fen());
    console.log('current move', gameApi.currentMove());
  };

  const testEval = () => toggle();

  //endtest

  return (
    <>
      <Position />
      <Button.Group orientation="vertical" classNames={{ group: styles.group }}>
        <StartButton />
        <ClearButton />
        <FlipButton />
        <SwitchModeButton />
        <TestButton label="position" onTest={test} />
        <TestButton label="eval" onTest={testEval} />
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
      radius="md"
      onClick={onClick}
      disabled={isDisabled}>
      {label}
    </Button>
  );
};

export const Position = () => {
  const position = useInitData();
  const [value, setValue] = useState('');
  const setFen = useMainStore((state) => state.setFenSliceFromInput);
  const newGame = useMainStore((state) => state.gameApi.newGame);

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
    const unsub = mainStore.subscribe(
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
    if (fen && fen != mainStore.getState().fen()) {
      setFen(fen);
      newGame();
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
  const boardApi = useMainStore((state) => state.boardApi);
  const resetFen = useMainStore((state) => state.resetFen);
  const newGame = useMainStore((state) => state.gameApi.newGame);

  const onStart = () => {
    boardApi.startBoard();
    resetFen(true);
    newGame();
  };

  return <EditorButton label="starting position" onClick={onStart} />;
};

export const ClearButton = () => {
  const mode = useMainStore((state) => state.mode);
  const boardApi = useMainStore((state) => state.boardApi);
  const resetFen = useMainStore((state) => state.resetFen);

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
  const boardApi = useMainStore((state) => state.boardApi);

  const onFlip = () => boardApi.flipBoard();

  return <EditorButton label="flip board" onClick={onFlip} />;
};

export const SwitchModeButton = () => {
  const [isEdit, setIsEdit] = useState(false);
  const isLegalFen = useMainStore((state) => state.isLegalFen);
  const setFenSliceAnalyse = useMainStore((state) => state.setFenSliceAnalyse);
  const switchMode = useMainStore((state) => state.switchMode);

  const label = isEdit ? 'analyse' : 'edit';

  const onClick = () => {
    if (setFenSliceAnalyse()) {
      switchMode({ mode: isEdit ? 'analyse' : 'editor' });
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
