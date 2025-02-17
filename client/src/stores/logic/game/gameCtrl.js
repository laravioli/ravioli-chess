import { GameAnalyse } from './gameAnalyse';
import { GameComputer } from './gameComputer';
import { GameOnline } from './gameOnline';

export class GameCtrl {
  constructor(chess) {
    this.chess = chess;
    this.selection = this.mapper();
  }

  mapper() {
    const games = [
      {
        info: {
          mode: 'analyse',
          engine: true,
          editable: true,
        },
        make: (e) => new GameAnalyse(e),
      },
      {
        info: {
          mode: 'computer',
          engine: true,
        },
        make: (e) => new GameComputer(e),
      },
      {
        info: {
          mode: 'online',
          engine: false,
        },
        make: (e) => new GameOnline(e),
      },
    ];

    return new Map(
      games.map((game) => [
        game.info.mode,
        { info: game.info, make: game.make },
      ])
    );
  }

  select(mode) {
    return this.selection.get(mode);
  }

  create(mode, opts) {
    const selected = this.select(mode);
    return selected.make({
      chess: this.chess,
      info: selected.info,
      opts,
    });
  }
}
