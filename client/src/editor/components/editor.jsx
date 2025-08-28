import { PageStoreProvider } from "src/main/context/provider";
import { Board } from "src/common/components/board/board";
import { FenInput } from "./fen/feninput";
import { Controls } from "./controls/controls";
import { SparePieces } from "./spare/spare";
import clsx from "clsx";
import layout from "../css/layout.module.css";
import variables from "../css/variables.module.css";
import classes from "../css/side.module.css";

const Side = () => (
  <div className={clsx(classes.side, "mantine-visible-from-sm")}>
    <div>
      <SparePieces side="top" />
      <Controls />
      <SparePieces side="bottom" />
    </div>
  </div>
);

const Editor = () => {
  return (
    <PageStoreProvider>
      <div className={clsx(layout.editor, variables.editor)}>
        <Board />
        <Side />
        <div className={layout.copyables}>
          <FenInput />
        </div>
      </div>
    </PageStoreProvider>
  );
};

export default Editor;
