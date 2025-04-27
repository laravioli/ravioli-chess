import { useState, useMemo, useCallback, useEffect } from 'react';
import { useInitData, useStore } from 'src/main/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { autorun } from 'mobx';
import { NativeSelect } from '@mantine/core';
import { short_fen } from './utils';
import classes from '../css/controls.module.css';

export const Positions = observer(() => {
  const { editorStore, fenStore } = useStore();
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

  const [value, setValue] = useState(matcher(fenStore.current));

  useEffect(() => {
    const disposer = autorun(() => {
      setValue(matcher(fenStore.current));
    });

    return disposer;
  }, []);

  const onChange = (event) => {
    const fen = event.currentTarget.value;
    if (fen) {
      editorStore.board.position(fen, true);
      fenStore.set(fen);
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
});
