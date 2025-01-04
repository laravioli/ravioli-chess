import { useRef, useEffect } from 'react';
import { useBoardStore } from '../../stores/boardstore.js';
import { Board } from './board.jsx';

export function BoardCanvas() {
  const canvasRef = useRef(null);
  const boardRef = useRef(null);
  const widget = useBoardStore((state) => state.widget);

  useEffect(() => {
    if (widget) {
      const resize = () => {
        const canvasWidth = canvasRef.current?.offsetWidth;
        const windowHeight = window.innerHeight;
        const newSize = Math.min(canvasWidth, windowHeight - 20);
        boardRef.current.style.width = `${newSize}px`;
        boardRef.current.style.height = `${newSize}px`;
        widget.resize(newSize);
      };
      window.addEventListener('resize', resize);
      resize();
      return () => window.removeEventListener('resize', resize);
    }
  }, [widget]);

  return (
    <div id="board-canvas" ref={canvasRef}>
      <Board divRef={boardRef} />
    </div>
  );
}
