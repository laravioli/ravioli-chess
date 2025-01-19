import { useState } from 'react';
import { Checkbox } from '@mantine/core';
import { useBoundStore } from '../../../stores/hooks/useboundstore';
import { mode } from '../../../stores/controllerstore';

export const CastlingBoxes = () => {
  const currentMode = useBoundStore((state) => state.currentMode);
  const isDisabled = currentMode === mode.editor ? false : true;
  return (
    <>
      <CastlingBox id="K" label="O-O" isDisabled={isDisabled} />
      <CastlingBox id="Q" label="O-O-O" isDisabled={isDisabled} />
      <CastlingBox id="k" label="o-o" isDisabled={isDisabled} />
      <CastlingBox id="q" label="o-o-o" isDisabled={isDisabled} />
    </>
  );
};

const CastlingBox = ({ id, label, isDisabled = true }) => {
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
      disabled={isDisabled}
    />
  );
};
