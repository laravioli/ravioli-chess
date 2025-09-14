import { usePageStore } from 'src/main/hooks/hooks';
import { Action } from 'src/common/components/controls/action';
import { IconTrash } from '@tabler/icons-react';
import { EMPTY_FEN } from 'chessops/fen';
import type { EditorStore } from 'src/editor/store/editor';
import type { FloatingPosition } from '@mantine/core';

export const ClearButton = ({ ttposition }: { ttposition: FloatingPosition }) => {
  const editorStore = usePageStore<EditorStore>();
  return (
    <Action label="clear board" ttposition={ttposition} onClick={() => editorStore.setFen(EMPTY_FEN)}>
      <IconTrash size={40} stroke={1.2} />
    </Action>
  );
};
