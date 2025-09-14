import { Action } from './action';
import { IconReload } from '@tabler/icons-react';
import type { FloatingPosition } from '@mantine/core';
import type { MouseEventHandler } from 'react';

interface StartButtonProps {
  ttposition: FloatingPosition;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

export const StartButton = ({ ttposition, onClick }: StartButtonProps) => {
  return (
    <Action label="reset board" ttposition={ttposition} onClick={onClick}>
      <IconReload size={40} stroke={1.2} />
    </Action>
  );
};
