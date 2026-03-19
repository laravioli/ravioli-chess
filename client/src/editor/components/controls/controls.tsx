import clsx from 'clsx';
import { Stack } from '@mantine/core';

import layout from '@/editor/css/layout.module.css';
import classes from '@/editor/css/controls.module.css';
import { TurnToPlay } from './turn';
import { CastlingBoxes } from './castlings';
import { Positions } from './positions';

export const Controls: React.FC = () => {
  return (
    <Stack className={clsx(layout.controls, classes.controls)}>
      <TurnToPlay />
      <CastlingBoxes />
      <Positions />
    </Stack>
  );
};
