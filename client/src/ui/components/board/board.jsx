import { useRef, useEffect } from 'react';
import { useBoundStore } from '../../../stores/hooks/useboundstore';

export function Board() {
  const divRef = useRef(null);
  const boardApi = useBoundStore((state) => state.boardApi);
  const setBoard = useBoundStore((state) => state.setBoard);

  useEffect(() => {
    const unsub = useBoundStore.subscribe(
      (state) => state.config,
      () => {
        setBoard(divRef.current);
      },
      { fireImmediately: true }
    );
    return () => {
      boardApi.destroyBoard();
      unsub();
    };
  }, [setBoard, boardApi]);

  return <div className="board" ref={divRef} />;
}
