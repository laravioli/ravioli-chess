import { Chess, DEFAULT_POSITION } from 'chess.js';
import { mode } from './controllerstore';

export const chess = new Chess();

export const createGameSlice = (set, get) => ({
  gameActions: {
    history: coHistory([], get),

    newGame: (action) => set((state) => get()._reducerNG(state, action)),
  },

  _reducerNG: (state, action) => {
    switch (action.mode) {
      case mode.game:
        chess.reset();
        return {
          gameActions: { ...state.gameActions, history: coHistory([], get) },
        };
      case mode.continue:
        chess.load(get().fen());
        return {
          gameActions: { ...state.gameActions, history: coHistory([], get) },
        };

      case mode.editor:
        chess.clear();
        return { gameActions: { ...state.gameActions, history: null } };

      default:
        chess.reset();
        return {
          config: { ...state.config, position: DEFAULT_POSITION },
          gameActions: { ...state.gameActions, history: coHistory([], get) },
        };
    }
  },

  _gameUpdateUI() {
    get().boardApi.setBoardPosition(chess.fen());
    get().setFenSliceFromChess(chess);
  },
});

function coroutine(func) {
  return function (...args) {
    const cr = func(...args);
    cr.next();
    return cr;
  };
}

const coHistory = coroutine(function* (history, get) {
  const stack = [history];
  const ptr = [history.length];
  const [coUndo, coRedo, coReset, coMove] = [
    undo(stack, ptr),
    redo(stack, ptr),
    reset(stack, ptr, get),
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
    get()._gameUpdateUI();
  }
});

const undo = coroutine(function* (stack, ptr) {
  while (true) {
    yield;
    if (stack.length > 1 && ptr.at(-1) == 1) {
      stack.pop();
      ptr.pop();
      chess.undo();
    } else if (ptr.at(-1) >= 1) {
      ptr.push(ptr.pop() - 1);
      chess.undo();
    }
  }
});

const redo = coroutine(function* (stack, ptr) {
  while (true) {
    yield;
    if (ptr.at(-1) >= 0 && ptr.at(-1) < stack.at(-1).length) {
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
      ptr.push(stack[0].length);
    }
  }
});

const move = coroutine(function* (stack, ptr) {
  while (true) {
    let move = yield;
    if (ptr.at(-1) == stack.at(-1).length) {
      stack.at(-1).push(move);
      ptr.push(ptr.pop() + 1);
    } else {
      stack.push([move]);
      ptr.push(1);
    }
  }
});
