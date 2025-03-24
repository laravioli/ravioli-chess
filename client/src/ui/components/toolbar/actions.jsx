import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button, NativeSelect } from '@mantine/core';
import styles from './toolbar.module.css';
import { mainStore, useMainStore, useEvalStore } from 'src/stores';
import { controller } from 'src/logic';
import { useInitData } from 'src/ui/context';
import { short_fen } from './utils';
import { DEFAULT_POSITION } from 'chess.js';

//todo reorganise this file
//for path: when user reload the page: init controller properly, when user navigate with client : use button to set the controller

export function Buttons({ children }) {
  //test purpose
  const toggle = useEvalStore((state) => state.toggle);

  const test = () => {
    console.log('board ' + controller.getBoard().fen());
    console.log('chess ' + controller.getGame()?.fen());
    console.log('fen ' + mainStore.getState().fen());
    console.log('current move', controller.getGame()?.currentMove);
  };

  const testEval = () => toggle();
  //end Test

  return (
    <>
      <Button.Group orientation="vertical" classNames={{ group: styles.group }}>
        {children}
        <TestButton label="position" onTest={test} />
        <TestButton label="eval" onTest={testEval} />
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

export const SwitchModeButton = () => {
  const [isEdit, setIsEdit] = useState(false);
  const isLegalFen = useMainStore((state) => state.isLegalFen);
  const setFenSliceAnalyse = useMainStore((state) => state.setFenSliceAnalyse);

  const label = isEdit ? 'analysis board' : 'edit board';

  const onClick = () => {
    if (setFenSliceAnalyse()) {
      controller.setMode(
        isEdit ? 'analysis' : 'editor',
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

export const TestButton = ({ label, onTest, style = {} }) => {
  return <EditorButton label={label} onClick={onTest} style={style} />;
};

export function NavAnalyse() {
  return (
    <p>
      <Link to="/analysis">Analyse</Link>
    </p>
  );
}

export function Navigate({ path }) {
  const navigate = useNavigate();
  const isLegalFen = useMainStore((state) => state.isLegalFen);
  const setFenSliceAnalyse = useMainStore((state) => state.setFenSliceAnalyse);

  const isEdit = path !== '/editor';
  const label = isEdit ? 'analysis board' : 'edit board';

  const onClick = () => {
    const fen = mainStore.getState().fen();
    if (setFenSliceAnalyse()) {
      controller.setMode(path.slice(1), fen);
      navigate(path, { replace: true });
    } else {
      controller.getBoard().position(fen);
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
