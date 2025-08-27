import { usePageStore } from "src/main/hooks/hooks";
import { INITIAL_FEN } from "chessops/fen";
import { Action } from "./action";
import { IconReload } from "@tabler/icons-react";

export const StartButton = () => {
  const store = usePageStore();

  const onStart = () => {
    store.reload?.(INITIAL_FEN);
    store.setFen?.(INITIAL_FEN);
  };

  return (
    <Action label="reset board" onClick={onStart}>
      <IconReload size={40} stroke={1.2} />
    </Action>
  );
};
