import { usePageStore } from "src/main/hooks/hooks";
import { useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import { Action } from "../tools/action";
import { IconMathMaxMin, IconEdit } from "@tabler/icons-react";
import { action } from "mobx";

export const Navigate = observer(({ path }) => {
  const pageStore = usePageStore();
  const navigate = useNavigate();
  const isEdit = path !== "/editor";
  const label = isEdit ? "analysis board" : "edit board";
  const Icon = isEdit ? IconMathMaxMin : IconEdit;

  const onClick = action(() => {
    if (!isEdit || pageStore.fen.legalFen) {
      navigate(path, {
        replace: true,
        state: { fen: pageStore.fen.current },
      });
    }
  });

  return (
    <Action
      label={label}
      onClick={onClick}
      disabled={isEdit && !pageStore.fen.legalFen}
    >
      <Icon size={30} stroke={1.2} />
    </Action>
  );
});
