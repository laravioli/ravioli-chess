import { PageStoreProvider } from "src/main/context/provider";
import { EvalBar } from "../tools/eval/bar";
import { Board } from "src/common/components/board/board";
import { Tools } from "../tools/tools";

const Analyse = () => {
  return (
    <PageStoreProvider>
      <div className={"page-analyse"}>
        <EvalBar />
        <Board />
        <Tools />
      </div>
    </PageStoreProvider>
  );
};

export default Analyse;
