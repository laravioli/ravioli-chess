import { useRef, useEffect } from 'react';
import { controller } from 'src/logic';

export function Board() {
  const divRef = useRef(null);
  useEffect(() => {
    controller.setBoard(divRef.current);
    return () => {
      controller.destroyBoard();
    };
  }, []);

  return <div className="board" ref={divRef} />;
}
