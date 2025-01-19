import { useState } from 'react';
import { Checkbox } from '@mantine/core';
import { useBoundStore } from '../../../stores/hooks/useboundstore';

export const CastlingBoxes = () => {
  return (
    <>
      <CastlingBox id="K" label="O-O" />
      <CastlingBox id="Q" label="O-O-O" />
      <CastlingBox id="k" label="o-o" />
      <CastlingBox id="q" label="o-o-o" />
    </>
  );
};

const CastlingBox = ({ id, label }) => {
  const [checked, setChecked] = useState(true);
  const setCastlingRight = useBoundStore((state) => state.setCastlingRight);
  const setFen = useBoundStore((state) => state.setFen);

  const onChange = (event) => {
    const isChecked = event.currentTarget.checked;
    setChecked(isChecked);
    setCastlingRight(id, isChecked);
    setFen();
  };

  return (
    <Checkbox
      checked={checked}
      label={label}
      color="gray"
      variant="outline"
      radius="xs"
      onChange={onChange}
    />
  );
};
