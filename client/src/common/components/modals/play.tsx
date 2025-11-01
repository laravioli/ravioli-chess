import { type ComponentType } from 'react';
import { FocusTrap, Stack, Group, Button } from '@mantine/core';
import { Link } from 'react-router';
import type { ContextModalProps } from '@mantine/modals';
import type { LobbySetupProps } from 'src/lib/lobby/components/setup';

interface PlayModalProps {
  modalBody: ComponentType<LobbySetupProps>;
  modalBodyProps: LobbySetupProps;
}

export const PlayModal = ({ context, id, innerProps }: ContextModalProps<PlayModalProps>) => (
  <>
    <FocusTrap.InitialFocus />
    <Stack>
      <innerProps.modalBody {...innerProps.modalBodyProps} />
      <Group justify="center" pt={10}>
        <Button component={Link} onClick={() => context.closeModal(id)} to="/play">
          Play
        </Button>
      </Group>
    </Stack>
  </>
);
