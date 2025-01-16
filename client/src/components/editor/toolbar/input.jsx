import { TextInput } from '@mantine/core';

export const FenInput = () => {
  return (
    <TextInput
      leftSectionPointerEvents="none"
      leftSection="FEN:"
      variant="filled"
      radius="xs"
      onChange={(e) => console.log(e.target.value)}
    />
  );
};
