import { Button } from '@mantine/core';

export const CButton = ({
  label,
  onClick = () => {},
  isDisabled = false,
  style = {},
}) => {
  return (
    <Button
      variant="filled"
      color="rgba(56, 56, 56, 0.85)"
      size="md"
      radius="md"
      onClick={onClick}
      disabled={isDisabled}
      style={style}>
      {label}
    </Button>
  );
};
