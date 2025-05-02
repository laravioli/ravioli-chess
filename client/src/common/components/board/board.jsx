import { useRef, useEffect } from 'react';

export function Board({ board, config }) {
  const divRef = useRef(null);

  useEffect(() => {
    board.mount(divRef.current, config);
    return () => {
      board.unMount();
    };
  }, [board, config]);

  return <div className="board" ref={divRef} />;
}
