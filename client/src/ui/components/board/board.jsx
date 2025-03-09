import { useRef, useEffect } from 'react';
import { mainStore, useMainStore } from 'src/stores/';

export function Board() {
  const divRef = useRef(null);
  const boardApi = useMainStore((state) => state.boardApi);
  const setBoard = useMainStore((state) => state.setBoard);

  useEffect(() => {
    const unsub = mainStore.subscribe(
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
