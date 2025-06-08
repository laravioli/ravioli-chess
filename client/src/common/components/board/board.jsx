import { useRef, useEffect } from 'react';
import { usePageStore } from 'src/main/hooks/hooks';

export function Board() {
  const divRef = useRef(null);
  const store = usePageStore();

  useEffect(() => {
    store.board.mount(divRef.current, store.makeBoardCfg());
    return () => {
      store.board.unMount();
    };
  }, [store]);

  return <div className="board" ref={divRef} />;
}
