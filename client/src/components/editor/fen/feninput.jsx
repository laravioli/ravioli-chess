import { TextInput } from '@mantine/core';
import { useState, useEffect } from 'react';
import { useBoundStore } from '../../../stores/hooks/useboundstore';

export const FenInput = () => {
  const fen = useBoundStore((state) => state.fen);
  const setFen = useBoundStore((state) => state.setFen);
  const [value, setValue] = useState(fen);

  useEffect(() => {
    setValue(fen);
  }, [fen]);

  const onChange = (event) => {
    setValue(event.currentTarget.value);
  };
  const onKeyDown = (event) => {
    if (event.key === 'Enter') {
      const success = setFen(value, true);
      if (!success) setValue(fen);
    }
  };

  return (
    <TextInput
      value={value}
      leftSectionPointerEvents="none"
      leftSection="FEN:"
      variant="filled"
      radius="xs"
      onChange={onChange}
      onKeyDown={onKeyDown}
    />
  );
};
