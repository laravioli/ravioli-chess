import { useRef, useEffect } from 'react';
import { useModule } from 'src/ui/context/hooks.js';
export function Board() {
  const divRef = useRef(null);
  const module = useModule();

  useEffect(() => {
    module.setBoard(divRef.current);
    return () => {
      module.destroyBoard();
    };
  }, [module]);

  return <div className="board" ref={divRef} />;
}
