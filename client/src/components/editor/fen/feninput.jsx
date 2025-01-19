import { TextInput } from '@mantine/core';
import { useBoundStore } from '../../../stores/hooks/useboundstore';

export const FenInput = () => {
  const fen = useBoundStore((state) => state.getFen());
  return (
    <TextInput
      value={fen}
      leftSectionPointerEvents="none"
      leftSection="FEN:"
      variant="filled"
      radius="xs"
      onChange={() => {}}
    />
  );
};
