import { useRef, useEffect } from 'react';

export function Board({ store }) {
  const divRef = useRef(null);

  useEffect(() => {
    store.board.mount(divRef.current, store.makeBoardCfg());
    return () => {
      store.board.unMount();
    };
  }, [store]);

  return <div className="board" ref={divRef} />;
}
