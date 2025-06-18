import { ActionIcon, Tooltip } from '@mantine/core';
import classes from './toolbar.module.css';

export const Action = ({ children, label, onClick, disabled = false }) => {
  const handler = disabled
    ? (event) => {
        event.preventDefault();
      }
    : onClick;

  return (
    <Tooltip label={label}>
      <ActionIcon
        className={classes.action}
        data-disabled={disabled}
        onClick={handler}>
        {children}
      </ActionIcon>
    </Tooltip>
  );
};
