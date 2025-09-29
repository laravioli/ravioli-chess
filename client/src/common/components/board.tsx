import { useRef, useEffect } from 'react';
import { usePageStore } from 'src/main/hooks/hooks';
import classes from '../css/board.module.css';

export function Board() {
  const divRef = useRef<HTMLDivElement | null>(null);
  const pageStore = usePageStore();

  useEffect(() => {
    pageStore.mountBoard(divRef.current!);
    return () => {
      pageStore.onUnMountBoard();
    };
  }, []);

  return <div className={classes.board} ref={divRef} />;
}
