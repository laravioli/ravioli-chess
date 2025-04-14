import { ActionIcon, Tooltip } from '@mantine/core';

export const Action = ({ children, label, onClick, disabled = false }) => {
  const handler = disabled
    ? (event) => {
        event.preventDefault();
      }
    : onClick;

  return (
    <Tooltip label={label}>
      <ActionIcon
        data-disabled={disabled}
        bg="inherit"
        size="sm"
        onClick={handler}
        bd={0}>
        {children}
      </ActionIcon>
    </Tooltip>
  );
};
