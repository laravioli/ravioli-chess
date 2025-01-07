import { useShallow } from 'zustand/shallow';
import { useBoardStore } from '../../stores/boardstore';
import { Button } from '../button/button';

export function EditorActions() {
  //probably better to use ref here, tbd
  const [chessRef, widget, config, dispatchConfig] = useBoardStore(
    useShallow((state) => [
      state.chessRef,
      state.widget,
      state.config,
      state.dispatchConfig,
    ])
  );

  const onStartingPosition = () => {
    widget.start();
    chessRef.load(widget.fen() + ' w KQkq - 0 1');
  };

  const onClearBoard = () => {
    widget.clear();
    chessRef.clear();
  };

  const onFlipBoard = () => {
    widget.flip();
  };

  //move logic into button

  const onContinue = () => {
    dispatchConfig({
      config: config.type === 'editor' ? 'game' : 'editor',
      position: 'current',
      orientation: widget.orientation,
    });
  };

  const test = () => {
    console.log(useBoardStore.getState().chessRef.fen());
    console.log(widget.fen());
    console.log(widget.position());
  };

  return (
    <div className="actions">
      <Button label="starting position" onClick={onStartingPosition} />
      <Button label="clear board" onClick={onClearBoard} />
      <Button label="flip board" onClick={onFlipBoard} />
      <Button label="continue from here" onClick={onContinue} />
      <Button label="position" onClick={test} />
    </div>
  );
}
