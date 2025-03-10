import { useState, useMemo, useEffect } from 'react';
import { Button, NativeSelect } from '@mantine/core';
import styles from './toolbar.module.css';
import { History } from './history';
import { mainStore, useMainStore, useEvalStore } from 'src/stores';
import { controller } from 'src/logic';
import { useInitData } from 'src/ui/context';
import { short_fen } from './utils';
import { DEFAULT_POSITION } from 'chess.js';

export function EditorActions() {
  //test purpose
  const toggle = useEvalStore((state) => state.toggle);

  const test = () => {
    console.log('board ' + controller.getBoard().fen());
    console.log('chess ' + controller.getGame()?.fen());
    console.log('fen ' + mainStore.getState().fen());
    console.log('current move', controller.getGame()?.currentMove);
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
  const setFen = useMainStore((state) => state.setFenFromInput);

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
      controller.newGame(fen);
      controller.getBoard().position(fen, true);
      setFen(fen);
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
  const resetFen = useMainStore((state) => state.resetFen);

  const onStart = () => {
    controller.newGame(DEFAULT_POSITION);
    controller.getBoard().start();
    resetFen(true);
  };

  return <EditorButton label="starting position" onClick={onStart} />;
};

export const ClearButton = () => {
  const mode = useMainStore((state) => state.mode);
  const resetFen = useMainStore((state) => state.resetFen);

  const onClear = () => {
    controller.getBoard().clear();
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
  const onFlip = () => controller.getBoard().flip();

  return <EditorButton label="flip board" onClick={onFlip} />;
};

export const SwitchModeButton = () => {
  const [isEdit, setIsEdit] = useState(false);
  const isLegalFen = useMainStore((state) => state.isLegalFen);
  const setFenSliceAnalyse = useMainStore((state) => state.setFenSliceAnalyse);

  const label = isEdit ? 'analyse' : 'edit';

  const onClick = () => {
    if (setFenSliceAnalyse()) {
      controller.setMode(
        isEdit ? 'analyse' : 'editor',
        mainStore.getState().fen()
      );

      setIsEdit(!isEdit);
    } else {
      controller.getBoard().position(mainStore.getState().fen());
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
