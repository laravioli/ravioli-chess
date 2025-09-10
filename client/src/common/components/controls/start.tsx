import { usePageStore } from "src/main/hooks/hooks";
import { INITIAL_FEN } from "chessops/fen";
import { Action } from "./action";
import { IconReload } from "@tabler/icons-react";

export const StartButton = ({ ttposition, onClick }) => {
  const store = usePageStore();

  return (
    <Action label="reset board" ttposition={ttposition} onClick={onClick}>
      <IconReload size={40} stroke={1.2} />
    </Action>
  );
};
