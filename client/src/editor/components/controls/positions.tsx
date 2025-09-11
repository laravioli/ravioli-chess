import { useState, useMemo, useCallback, useEffect } from 'react';
import { useHTMLData, usePageStore } from 'src/main/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { autorun } from 'mobx';
import { NativeSelect } from '@mantine/core';
import { short_fen } from './utils';
import classes from '../../css/controls.module.css';

export const Positions = observer(() => {
  const editorStore = usePageStore();
  const { positions } = useHTMLData();

  const data = useMemo(
    () => [
      { label: 'select position', value: '' },
      ...positions.map(obj => ({
        label: [obj.eco, obj.name].join(' '),
        value: obj.fen,
      })),
    ],
    [positions],
  );
  const fens = useMemo(() => data.map(obj => short_fen(obj.value)), [data]);

  const matcher = useCallback(
    fen => {
      const match = fens.findIndex(pos => pos === short_fen(fen));
      if (match > 0) {
        return data[match].value;
      } else {
        return data[0].value;
      }
    },
    [data, fens],
  );

  const [value, setValue] = useState(() => matcher(editorStore.fen.current));

  useEffect(() => {
    return autorun(() => {
      setValue(matcher(editorStore.fen.current));
    });
  }, []);

  const onChange = event => {
    const fen = event.currentTarget.value;
    if (fen) {
      editorStore.setFen(fen);
    } else {
      setValue(fen);
    }
  };

  return (
    <NativeSelect value={value} onChange={onChange} data={data} classNames={{ input: classes.select }} />
  );
});
