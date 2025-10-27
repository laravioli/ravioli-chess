import { usePageStore } from 'src/main/hooks/hooks';
import { useToolTipConfig } from './tooltip';
import { ActionIcon, Tooltip } from '@mantine/core';
import { IconRepeat, IconReload } from '@tabler/icons-react';
import classes from '../../css/action.module.css';
import type { MouseEventHandler, ReactNode } from 'react';

interface ActionsProps {
  children: ReactNode;
  label: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

export const Action = ({ children, label, onClick, disabled = false }: ActionsProps) => {
  const handler: MouseEventHandler<HTMLButtonElement> = disabled
    ? event => {
        event.preventDefault();
      }
    : onClick;

  const tooltipProps = useToolTipConfig();

  return (
    <Tooltip label={label} {...tooltipProps}>
      <ActionIcon className={classes.button} data-disabled={disabled} onClick={handler}>
        {children}
      </ActionIcon>
    </Tooltip>
  );
};

export const StartButton = ({ onClick }: { onClick: MouseEventHandler<HTMLButtonElement> }) => {
  return (
    <Action label="reset board" onClick={onClick}>
      <IconReload size={40} stroke={1.2} />
    </Action>
  );
};

export const FlipButton = () => {
  const store = usePageStore();
  const onFlip = () => {
    store.flip();
  };

  return (
    <Action label="flip board" onClick={onFlip}>
      <IconRepeat size={40} stroke={1.2} />
    </Action>
  );
};
