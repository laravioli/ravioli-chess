import { observer } from "mobx-react-lite";
import { usePageStore } from "src/main/hooks/hooks";
import { TextInput } from "@mantine/core";
import layout from "../../css/layout.module.css";
import classes from "src/common/css/fen.module.css";

export const FenInput = observer(() => {
  const analyseStore = usePageStore();

  return (
    <TextInput
      value={analyseStore.node.fen}
      className={layout.copyables}
      leftSectionPointerEvents="none"
      leftSection="FEN"
      variant="filled"
      readOnly
      classNames={{ root: classes.root, input: classes.input }}
    />
  );
});
