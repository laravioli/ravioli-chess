import { useRef, useEffect } from 'react';
import { usePageStore } from 'src/main/hooks/hooks';

export function Board() {
  const divRef = useRef(null);
  const pageStore = usePageStore();

  useEffect(() => {
    pageStore.board.mount(divRef.current, pageStore.makeBoardCfg());
    return () => {
      pageStore.board.unMount();
    };
  }, []);

  return <div className="board" data-side="white" ref={divRef} />;
}
