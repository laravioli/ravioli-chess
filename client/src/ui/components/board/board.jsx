import { useRef, useEffect } from 'react';
import { mainStore } from 'src/stores';
import { controller } from 'src/logic';

export function Board() {
  const divRef = useRef(null);

  useEffect(() => {
    const unsub = mainStore.subscribe(
      (state) => state.mode,
      () => {
        controller.setBoard(divRef.current);
      },
      { fireImmediately: true }
    );
    return () => {
      controller.destroyBoard();
      unsub();
    };
  }, []);

  return <div className="board" ref={divRef} />;
}
