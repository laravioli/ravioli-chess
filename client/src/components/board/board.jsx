import { useRef, useEffect } from 'react';
import { useBoundStore } from '../../stores/hooks/useboundstore';

export function Board() {
  const divRef = useRef(null);
  const config = useBoundStore((state) => state.config);
  const setBoard = useBoundStore((state) => state.setBoard);
  const destroyBoard = useBoundStore((state) => state.destroyBoard);

  useEffect(() => {
    setBoard(divRef.current);
    return () => destroyBoard();
  }, [divRef, config, setBoard, destroyBoard]);

  return <div className="board" ref={divRef} />;
}
