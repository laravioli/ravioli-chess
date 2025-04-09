import { Flex } from '@mantine/core';

export function Controls({ children }) {
  return (
    <>
      <Flex
        h={20}
        bg="var(--mantine-color-body)"
        align="flex-start"
        justify="flex-start"
        gap="sm"
        direction={{ base: 'row', md: 'column' }}>
        {children}
      </Flex>
    </>
  );
}
