import { usePageStore } from "src/main/hooks/hooks";
import { Action } from "src/common/components/tools/action";
import { IconTrash } from "@tabler/icons-react";
import { EMPTY_FEN } from "chessops/fen";

export const ClearButton = () => {
  const editorStore = usePageStore();
  return (
    <Action label="clear board" onClick={() => editorStore.setFen(EMPTY_FEN)}>
      <IconTrash size={40} stroke={1.5} />
    </Action>
  );
};
