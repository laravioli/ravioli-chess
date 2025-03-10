import { useRef, useEffect } from 'react';
import { mainStore } from 'src/stores';
import { controller } from 'src/logic';

export function Board() {
  const divRef = useRef(null);

  useEffect(() => {
    const unsub = mainStore.subscribe(
      (state) => state.config,
      (config) => {
        controller.setBoard(divRef.current, config);
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
