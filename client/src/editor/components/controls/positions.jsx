import { useState, useMemo, useCallback, useEffect } from 'react';
import { useInitData, useModule } from 'src/shared/hooks/hooks';
import { subscribe } from 'valtio';
import { NativeSelect } from '@mantine/core';
import { short_fen } from './utils';
import classes from '../css/controls.module.css';

export const Positions = () => {
  const editor = useModule();
  const position = useInitData();

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

  const matcher = useCallback(
    (fen) => {
      const match = fens.findIndex((pos) => pos === short_fen(fen));
      if (match > 0) {
        return data[match].value;
      } else {
        return data[0].value;
      }
    },
    [data, fens]
  );

  const [value, setValue] = useState(matcher(editor.fen.current));

  useEffect(() => {
    const unsub = subscribe(editor.fen, () =>
      setValue(matcher(editor.fen.current))
    );
    return unsub;
  }, [editor, matcher]);

  const onChange = (event) => {
    const fen = event.currentTarget.value;
    if (fen) {
      editor.board.position(fen, true);
      editor.fen.setFen(fen);
    } else {
      setValue(fen);
    }
  };

  return (
    <NativeSelect
      value={value}
      onChange={onChange}
      data={data}
      classNames={{ wrapper: classes.wrapper }}
    />
  );
};
