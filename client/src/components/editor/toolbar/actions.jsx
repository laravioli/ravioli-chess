import { Button, Select } from '@mantine/core';
import styles from './toolbar.module.css';
import { History } from './history';
import { chess } from '../../../stores/gamestore';
import { useState, useMemo } from 'react';
import { useBoundStore } from '../../../stores/hooks/useboundstore';
import { useInitData } from '../../../context';

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
  const [value, setValue] = useState(null);
  const setFen = useBoundStore((state) => state.setFenSliceFromInput);
  const gameActions = useBoundStore((state) => state.gameActions);

  const data = useMemo(
    () =>
      position.map((item) => ({
        label: [item.eco, item.name].join(' '),
        value: item.fen,
      })),
    [position]
  );

  const onChange = (value) => {
    setValue(value);
    setFen(value);
    if (useBoundStore.getState().mode == 'continue') {
      //todo : implement a default option, set game correctly (eventualy change gamestore)
      gameActions.newGame({});
    }
  };

  return (
    <Select
      placeholder="select position"
      value={value ? value : null}
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
  const mode = useBoundStore((state) => state.mode);

  const onStart = () => {
    boardApi.startBoard();
    resetFen(true);
    if (mode == 'continue') {
      gameActions.newGame({});
    }
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
