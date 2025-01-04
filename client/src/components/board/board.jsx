import { useEffect } from 'react';
import { useBoardStore } from '../../stores/boardstore.js';

export function Board({ divRef }) {
  const config = useBoardStore((state) => state.config);
  const setWidget = useBoardStore((state) => state.setWidget);
  const destroyWidget = useBoardStore((state) => state.destroyWidget);

  useEffect(() => {
    setWidget(divRef.current);
    return () => destroyWidget();
  }, [divRef, config, setWidget, destroyWidget]);
  return <div ref={divRef} />;
}
