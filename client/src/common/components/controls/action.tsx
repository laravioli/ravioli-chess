import { useToolTipConfig } from './tooltip';
import { ActionIcon, Tooltip } from '@mantine/core';
import type { MouseEventHandler, ReactNode } from 'react';

interface ActionsProps {
  children: ReactNode;
  className: string;
  label: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

export const Action = ({ children, className, label, onClick, disabled = false }: ActionsProps) => {
  const handler: MouseEventHandler<HTMLButtonElement> = disabled
    ? event => {
        event.preventDefault();
      }
    : onClick;

  const tooltipProps = useToolTipConfig();

  return (
    <Tooltip label={label} {...tooltipProps}>
      <ActionIcon classNames={{ root: className }} data-disabled={disabled} onClick={handler}>
        {children}
      </ActionIcon>
    </Tooltip>
  );
};
