import { PageStoreProvider } from "src/main/context/provider";
import { Board } from "src/common/components/board/board";
import { FenInput } from "../fen/feninput";
import { Controls } from "../controls/controls";

const Side = () => (
  <div className="editor__side">
    <Controls />
  </div>
);

const Editor = () => {
  return (
    <PageStoreProvider>
      <div className={"page-editor"}>
        <Board />
        <Side />
        <FenInput />
      </div>
    </PageStoreProvider>
  );
};

export default Editor;
