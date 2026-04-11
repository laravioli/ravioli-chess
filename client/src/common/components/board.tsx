import React, { useRef, useEffect } from 'react';

import { usePageStore } from '@/core/hooks';

import classes from '@/common/css/board.module.css';

export const Board: React.FC = () => {
  const divRef = useRef<HTMLDivElement | null>(null);
  const pageStore = usePageStore();

  useEffect(() => {
    pageStore.mountBoard(divRef.current!);
    return () => {
      pageStore.onUnMountBoard();
    };
  }, []);

  return (
    <div className={classes.boardWrap}>
      <div className={classes.board} ref={divRef} />
    </div>
  );
};
