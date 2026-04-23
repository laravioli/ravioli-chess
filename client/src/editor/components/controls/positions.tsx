import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { autorun } from 'mobx';
import { observer } from 'mobx-react-lite';
import { NativeSelect } from '@mantine/core';

import { useHTMLData, usePageStore } from '@/core/hooks';
import { chessPositionsOptions } from '@/lib/api/@tanstack/react-query.gen';
import classes from '@/editor/css/controls.module.css';
import type { EditorStore } from '@/editor/store/editor';
import { short_fen } from './utils';

export const Positions: React.FC = observer(() => {
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const editorStore = usePageStore<EditorStore>();
  const htmlData = useHTMLData();
  const { data: positions = [] } = useQuery({
    ...chessPositionsOptions(),
    enabled: isClicked,
    initialData: htmlData?.positions,
  });

  const data = useMemo(
    () => [
      { label: 'select position', value: '' },
      ...positions.map((obj) => ({
        label: [obj.eco, obj.name].join(' '),
        value: obj.fen,
      })),
    ],
    [positions],
  );
  const fens = useMemo(() => data.map((obj) => short_fen(obj.value)), [data]);

  const matcher = useCallback(
    (fen: FEN) => {
      const match = fens.findIndex((pos) => pos === short_fen(fen));
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
  });

  const onChange = (event) => {
    const fen = event.currentTarget.value;
    if (fen) {
      editorStore.setFen(fen);
    } else {
      setValue(fen);
    }
  };

  return (
    <NativeSelect
      value={value}
      onFocus={() => {
        if (!isClicked) setIsClicked(true);
      }}
      onChange={onChange}
      data={data}
      classNames={{ input: classes.select }}
    />
  );
});
