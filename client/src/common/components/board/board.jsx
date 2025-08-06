import { useRef, useEffect } from "react";
import { usePageStore } from "src/main/hooks/hooks";

export function Board() {
  const divRef = useRef(null);
  const pageStore = usePageStore();

  useEffect(() => {
    pageStore.mountBoard(divRef.current);
    return () => {
      pageStore.onUnMountBoard();
    };
  }, []);

  return <div className="board" ref={divRef} />;
}
