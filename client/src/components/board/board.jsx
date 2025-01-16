import { useRef, useEffect } from 'react';
import { useBoundStore } from '../../stores/hooks/useboundstore';

export function Board() {
  const divRef = useRef(null);
  const config = useBoundStore((state) => state.config);
  const boardApi = useBoundStore((state) => state.boardApi);

  useEffect(() => {
    boardApi.setBoard(divRef.current);
    return () => boardApi.destroyBoard();
  }, [config, boardApi]);

  return <div className="board" ref={divRef} />;
}
