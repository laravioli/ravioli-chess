import { mainStore } from 'src/main/store';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useInitData, useModule } from 'src/shared/hooks/hooks';
import { NativeSelect } from '@mantine/core';
import { short_fen } from './utils';
import classes from '../css/controls.module.css';

export const Positions = () => {
  const module = useModule();

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

  const [value, setValue] = useState(matcher(module.fen.current()));

  useEffect(() => {
    const unsub = mainStore.subscribe(
      (state) => state.fen.current(),
      (fen) => setValue(matcher(fen))
    );
    return unsub;
  }, [matcher]);

  const onChange = (event) => {
    const fen = event.currentTarget.value;
    if (fen && fen != module.fen.current()) {
      module.newGame?.(fen);
      module.getBoard().position(fen, true);
      module.fen.setFen(fen);
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
