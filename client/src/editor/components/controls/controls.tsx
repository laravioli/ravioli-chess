import { TurnToPlay } from './turn';
import { CastlingBoxes } from './castlings';
import { Positions } from './positions';
import { Stack } from '@mantine/core';
import clsx from 'clsx';
import layout from '../../css/layout.module.css';
import classes from '../../css/controls.module.css';

export const Controls = () => {
  return (
    <Stack className={clsx(layout.controls, classes.controls)}>
      <TurnToPlay />
      <CastlingBoxes />
      <Positions />
    </Stack>
  );
};
