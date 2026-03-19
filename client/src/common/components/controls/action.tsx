import type { MouseEventHandler, ReactNode } from 'react';
import { ActionIcon, Tooltip } from '@mantine/core';

import { useToolTipConfig } from './tooltip';

interface ActionsWithToolTipProps {
  children: ReactNode;
  className: string;
  label: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

export const ActionWithToolTip: React.FC<ActionsWithToolTipProps> = ({
  children,
  className,
  label,
  onClick,
  disabled = false,
}) => {
  const handler: MouseEventHandler<HTMLButtonElement> = disabled
    ? (event) => {
        event.preventDefault();
      }
    : onClick;

  const tooltipProps = useToolTipConfig();

  return (
    <Tooltip
      label={label}
      {...tooltipProps}
    >
      <ActionIcon
        classNames={{ root: className }}
        data-disabled={disabled}
        onClick={handler}
      >
        {children}
      </ActionIcon>
    </Tooltip>
  );
};
