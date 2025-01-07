import { create } from 'zustand';
import chessBoard from 'chessboard';
import { Chess } from 'chess.js';
import { EDITOR, GAME } from '../configs/boardconfig';
import { onDragStart, onDrop } from '../configs/logicconfig';

//refactor the store(follow github doc and zustand website)

export const useBoardStore = create((set) => ({
  chessRef: new Chess(),
  config: EDITOR,
  widget: null,
  dispatchConfig: (action) => set((state) => configReducer(state, action)),
  setWidget: (div) => setWidget(div),

  destroyWidget: () => destroyWidget(),
}));

const configReducer = (state, action) => {
  let config = null;

  switch (action.config) {
    case 'editor':
      config = EDITOR;
      break;
    case 'game':
      config = GAME;
      break;
    default:
      return state;
  }

  switch (action.position) {
    case 'current':
      config.position = useBoardStore.getState().widget.fen() + ' w KQkq - 0 1';
      break;
    default:
      config.position = 'start';
      break;
  }

  switch (action.orientation) {
    case 'write':
    case 'black':
      config.orientation = action.orientation;
      break;
    default:
      config.orientation = 'write';
      break;
  }

  return { config: config };
};

const setWidget = (div) => {
  const chessRef = useBoardStore.getState().chessRef;
  const config = useBoardStore.getState().config;
  let widget = null;
  console.log(config);

  switch (config.type) {
    case 'editor':
      widget = chessBoard(div, config);
      break;
    case 'game': {
      const onSnapEnd = () => {
        widget.position(chessRef.fen());
      };
      widget = chessBoard(div, {
        ...config,
        onDragStart: onDragStart(chessRef),
        onDrop: onDrop(chessRef),
        onSnapEnd: onSnapEnd,
      });
      config.position === 'start'
        ? chessRef.load()
        : chessRef.load(config.position);
      break;
    }
    default:
      widget = chessBoard(div, config);
      break;
  }
  window.addEventListener('resize', widget.resize);
  useBoardStore.setState({ widget: widget });
};

const destroyWidget = () => {
  window.removeEventListener('resize', useBoardStore.getState().widget.resize);
  useBoardStore.getState().widget?.destroy();
};
