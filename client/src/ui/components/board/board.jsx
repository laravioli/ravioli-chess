import { useRef, useEffect } from 'react';
import { getModule } from 'src/logic';

export function Board() {
  const divRef = useRef(null);
  useEffect(() => {
    getModule().setBoard(divRef.current);
    return () => {
      getModule().destroyBoard();
    };
  }, []);

  return <div className="board" ref={divRef} />;
}
