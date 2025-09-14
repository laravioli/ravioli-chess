import { ActionIcon, Tooltip } from '@mantine/core';
import type { FloatingPosition } from '@mantine/core';
import classes from '../../css/icon.module.css';
import type { MouseEventHandler, ReactNode } from 'react';

interface ActionsProps {
  children: ReactNode;
  label: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  ttposition: FloatingPosition;
  disabled?: boolean;
}

export const Action = ({ children, label, onClick, ttposition, disabled = false }: ActionsProps) => {
  const handler: MouseEventHandler<HTMLButtonElement> = disabled
    ? event => {
        event.preventDefault();
      }
    : onClick;

  return (
    <Tooltip label={label} position={ttposition} color="gray" withArrow>
      <ActionIcon className={classes.icon} data-disabled={disabled} onClick={handler}>
        {children}
      </ActionIcon>
    </Tooltip>
  );
};
