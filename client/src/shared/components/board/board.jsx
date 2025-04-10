import { useRef, useEffect } from 'react';
import { useModule } from 'src/shared/hooks/hooks';
import { mainStore } from 'src/main/store';

export function Board() {
  const divRef = useRef(null);
  const module = useModule();

  useEffect(() => {
    module.setBoard(divRef.current);
    return () => {
      module.destroyBoard();
    };
  }, [module]);

  useEffect(() => {
    const unsub = mainStore.subscribe(
      (state) => state.side,
      (side) => {
        module.getBoard().orientation(side);
      },
      { fireImmediately: true }
    );
    return unsub;
  }, [module]);

  return <div className="board" ref={divRef} />;
}
