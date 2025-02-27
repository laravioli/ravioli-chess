import { DEFAULT_POSITION } from 'chess.js';
import { GameAnalyse } from './gameAnalyse';
import { GameComputer } from './gameComputer';
import { GameOnline } from './gameOnline';

class ChessCtrl {
  constructor() {
    this.setMode('analyse', DEFAULT_POSITION);
    this.ceval = undefined;
  }

  setMode(mode, initalFen) {
    if (this.mode !== mode) this.initGame(mode, { fen: initalFen });
    this.mode = mode;
  }

  getGame() {
    return this.game;
  }

  initGame(mode, info) {
    let game = undefined;
    if (mode === 'analyse') {
      game = new GameAnalyse(info);
    } else if (mode === 'computer') {
      game = new GameComputer(info);
    } else if (mode === 'online') {
      game = new GameOnline(info);
    }
    this.game = game;
  }

  newGame(fen, history = []) {
    this.game?.newGame(fen, history);
  }
}

export const chessController = new ChessCtrl();
