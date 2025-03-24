import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button, NativeSelect } from '@mantine/core';
import styles from './toolbar.module.css';
import { mainStore, useMainStore, useEvalStore } from 'src/stores';
import { controller } from 'src/logic';
import { useInitData } from 'src/ui/context';
import { short_fen } from './utils';
import { DEFAULT_POSITION } from 'chess.js';

//todo reorganise this file
//for path: when user reload the page: init controller properly, when user navigate with client : use button to set the controller

//---------Test-----------//
const TestButton = ({ label, onTest, style = {} }) => {
  return <EditorButton label={label} onClick={onTest} style={style} />;
};

const test = () => {
  console.log('board ' + controller.getBoard().fen());
  console.log('chess ' + controller.getGame()?.fen());
  console.log('fen ' + mainStore.getState().fen());
  console.log('current move', controller.getGame()?.currentMove);
};
//------------------------//

export function Buttons({ children }) {
  return (
    <>
      <Button.Group orientation="vertical" classNames={{ group: styles.group }}>
        {children}
        <TestButton label="test" onTest={test} />
      </Button.Group>
    </>
  );
}

const EditorButton = ({
  label,
  onClick = () => {},
  isDisabled = false,
  style = {},
}) => {
  return (
    <Button
      variant="filled"
      color="rgba(56, 56, 56, 0.85)"
      size="md"
      radius="md"
      onClick={onClick}
      disabled={isDisabled}
      style={style}>
      {label}
    </Button>
  );
};

export const Position = () => {
  const position = useInitData();
  const [value, setValue] = useState('');
  const setFen = useMainStore((state) => state.setFen);

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
  const resetFen = useMainStore((state) => state.resetFen);

  const onClear = () => {
    controller.getBoard().clear();
    resetFen(false);
  };

  return (
    <EditorButton
      label="clear board"
      onClick={onClear}
      isDisabled={controller.mode !== 'editor'}
    />
  );
};

export const FlipButton = () => {
  const onFlip = () => controller.getBoard().flip();

  return <EditorButton label="flip board" onClick={onFlip} />;
};

export function Navigate({ path }) {
  const navigate = useNavigate();
  const isLegalFen = useMainStore((state) => state.isLegalFen);
  const isFenAnalysable = useMainStore((state) => state.isFenAnalysable);

  const isEdit = path !== '/editor';
  const label = isEdit ? 'analysis board' : 'edit board';

  const onClick = () => {
    if (isFenAnalysable()) {
      controller.setMode(path.slice(1), mainStore.getState().fen());
      navigate(path, { replace: true });
    } else {
      controller.getBoard().position(mainStore.getState().fen());
    }
  };

  return (
    <EditorButton
      label={label}
      onClick={onClick}
      isDisabled={isEdit && !isLegalFen}
      style={{ margin: '0px 0px 12px 0px' }}
    />
  );
}

export const ToggleEval = () => {
  const toggle = useEvalStore((state) => state.toggle);
  const onClick = () => toggle();

  return <EditorButton label="eval" onClick={onClick} />;
};
