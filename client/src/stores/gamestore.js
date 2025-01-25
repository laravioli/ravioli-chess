import { Chess } from 'chess.js';
import { mode } from './controllerstore';

export const chess = new Chess();

export const createGameSlice = (set, get) => ({
  gameHistory: dispatch([], get),
  gameActions: {
    resetGame: () => {
      chess.reset();
    },

    _updateUI() {
      get().boardApi.setBoardPosition(chess.fen());
      get().setFenSliceFromChess(chess);
    },
  },

  dispatchNewGame: (action) => set((state) => get()._reducerNG(state, action)),
  _reducerNG: (state, action) => {
    switch (action.mode) {
      case mode.game:
        chess.reset();
        set({ gameHistory: dispatch([], get) });
        break;
      case mode.continue:
        chess.load(get().fen());
        set({ gameHistory: dispatch([], get) });
        break;

      case mode.editor:
        chess.clear();
        break;

      default:
        break;
    }
    return { gameHistory: [], gamePointer: 0 };
  },
});

function coroutine(func) {
  return function (...args) {
    const cr = func(...args);
    cr.next();
    return cr;
  };
}

const undo = coroutine(function* (stack, ptr) {
  while (true) {
    yield;
    if (stack.length > 1 && ptr.at(-1) == 0) {
      stack.pop();
      ptr.pop();
    } else if (ptr.at(-1) > 0) {
      ptr.push(ptr.pop() - 1);
    }
    if (stack[0].length > 0) {
      chess.undo();
    }
  }
});

const redo = coroutine(function* (stack, ptr) {
  while (true) {
    yield;
    if (ptr.at(-1) < stack.at(-1).length - 1) {
      chess.move(stack.at(-1)[ptr.at(-1)]);
      ptr.push(ptr.pop() + 1);
    }
  }
});

const reset = coroutine(function* (stack, ptr, get) {
  while (true) {
    let action = yield;
    if (stack.length > 1) {
      stack.splice(1);
    }
    ptr.splice(0);
    if (action == 'start') {
      chess.load(get().config.position);
      ptr.push(0);
    }
    if (action == 'end') {
      chess.load(get().config.position);
      stack[0].forEach((mv) => chess.move(mv));
      ptr.push(stack[0].length - 1);
    }
  }
});

const move = coroutine(function* (stack, ptr) {
  while (true) {
    let move = yield;
    if (ptr.at(-1) == stack.at(-1).length - 1) {
      stack.at(-1).push(move);
      ptr.push(ptr.pop() + 1);
    } else {
      stack.push([move]);
      ptr.push(0);
    }
  }
});

const dispatch = coroutine(function* (history, get) {
  const stack = [history];
  const ptr = [history.length - 1];
  const [coUndo, coRedo, coReset, coMove] = [
    undo(stack, ptr),
    redo(stack, ptr),
    reset(stack, ptr),
    move(stack, ptr),
  ];
  while (true) {
    let action = yield;
    switch (action) {
      case 'undo':
        coUndo.next();
        break;
      case 'redo':
        coRedo.next();
        break;
      case 'start':
      case 'end':
        coReset.next(action);
        break;
      default:
        coMove.next(action);
        break;
    }
    get().gameActions._updateUI();
    console.log(stack, ptr);
  }
});
