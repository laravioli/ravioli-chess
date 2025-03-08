/*interface Work {
    path: string;
    search: SearchBy;
    ply: number;
    threatMode: boolean;



    threads: number;
    hashSize: number | undefined;
    gameId: string | undefined; // send ucinewgame when changed
    stopRequested: boolean;
  
    multiPv: number;
    initialFen: string;
    currentFen: string;
    moves: string[];
    emit: (ev: Tree.LocalEval) => void;
  }*/

export class Protocol {
  expectedPvs = 1;
  options = new Map();

  constructor() {}

  connected(send) {
    this.send = send;

    // Get engine name, version and options.
    this.options = new Map([
      ['Threads', '1'],
      ['Hash', '16'],
      ['MultiPV', '1'],
      ['UCI_Variant', 'chess'],
    ]);
    this.send('uci');
  }

  setOption(name, value) {
    value = value.toString();
    if (this.send && this.options.get(name) !== value) {
      this.send(`setoption name ${name} value ${value}`);
      this.options.set(name, value);
    }
  }

  disconnected() {
    if (this.work && this.currentEval) this.work.emit(this.currentEval);
    this.work = undefined;
    this.send = undefined;
  }

  received(command) {
    //log for debug
    //console.log(`rcv : ${command}`);
    //
    const parts = command.trim().split(/\s+/g);
    if (parts[0] === 'uciok') {
      // Analyse without contempt.
      this.setOption('UCI_AnalyseMode', 'true');

      // Affects notation only. Life would be easier if everyone would always
      // unconditionally use this mode.
      this.setOption('UCI_Chess960', 'true');

      this.send?.('ucinewgame');
      this.send?.('isready');
    } else if (parts[0] === 'readyok') {
      this.swapWork();
    } else if (parts[0] === 'id' && parts[1] === 'name') {
      this.engineName = parts.slice(2).join(' ');
    } else if (parts[0] === 'bestmove') {
      console.log(`rcv : ${command}`);

      if (this.work && this.currentEval) this.work.emit(this.currentEval);
      this.work = undefined;
      this.swapWork();
      return;
    } else if (this.work && !this.work.stopRequested && parts[0] === 'info') {
      let depth = 0,
        nodes,
        multiPv = 1,
        millis,
        evalType,
        isMate = false,
        povEv,
        moves = [];
      for (let i = 1; i < parts.length; i++) {
        switch (parts[i]) {
          case 'depth':
            depth = parseInt(parts[++i]);
            break;
          case 'nodes':
            nodes = parseInt(parts[++i]);
            break;
          case 'multipv':
            multiPv = parseInt(parts[++i]);
            break;
          case 'time':
            millis = parseInt(parts[++i]);
            break;
          case 'score':
            isMate = parts[++i] === 'mate';
            povEv = parseInt(parts[++i]);
            if (parts[i + 1] === 'lowerbound' || parts[i + 1] === 'upperbound')
              evalType = parts[++i];
            break;
          case 'pv':
            moves = parts.slice(++i);
            i = parts.length;
            break;
        }
      }

      // Sometimes we get #0. Let's just skip it.
      if (isMate && !povEv) return;

      // Track max pv index to determine when pv prints are done.
      if (this.expectedPvs < multiPv) this.expectedPvs = multiPv;

      if (
        nodes === undefined ||
        millis === undefined ||
        isMate === undefined ||
        povEv === undefined
      )
        return;

      const pivot = this.work.threatMode ? 0 : 1;
      const ev = this.work.ply % 2 === pivot ? -povEv : povEv;

      // For now, ignore most upperbound/lowerbound messages.
      // However non-primary pvs may only have an upperbound.
      if (evalType && multiPv === 1) return;

      const pvData = {
        moves,
        cp: isMate ? undefined : ev,
        mate: isMate ? ev : undefined,
        depth,
      };

      if (multiPv === 1) {
        this.currentEval = {
          fen: this.work.currentFen,
          depth,
          nodes,
          millis,
          cp: isMate ? undefined : ev,
          mate: isMate ? ev : undefined,
          pvs: [pvData],
        };
      } else if (this.currentEval) {
        this.currentEval.pvs.push(pvData);
        this.currentEval.depth = Math.min(this.currentEval.depth, depth);
      }

      if (multiPv === this.expectedPvs && this.currentEval) {
        this.work.emit(this.currentEval);
        if (depth >= 99) this.stop();
      }
    } else if (
      command &&
      !['Stockfish', 'id', 'option', 'info'].includes(parts[0]) &&
      !['Analysis Contempt', 'UCI_Variant', 'UCI_AnalyseMode'].includes(
        command.split(': ')[1]
      )
    )
      console.warn(`SF: ${command}`);
  }

  stop() {
    if (this.work && !this.work.stopRequested) {
      this.work.stopRequested = true;
      this.send?.('stop');
    }
  }

  swapWork() {
    if (!this.send || this.work) return;

    this.work = this.nextWork;
    this.nextWork = undefined;

    if (this.work) {
      this.currentEval = undefined;
      this.expectedPvs = 1;

      this.setOption('Threads', this.work.threads);
      this.setOption('Hash', this.work.hashSize || 16);
      this.setOption('MultiPV', Math.max(1, this.work.multiPv));

      if (this.gameId && this.gameId !== this.work.gameId)
        this.send('ucinewgame');
      this.gameId = this.work.gameId;

      this.send(
        [
          'position fen',
          this.work.initialFen,
          'moves',
          ...this.work.moves,
        ].join(' ')
      );
      const [by, value] = Object.entries(this.work.search)[0];
      this.send(`go ${by} ${value}`);
    }
  }

  compute(nextWork) {
    this.nextWork = nextWork;
    this.stop();
    this.swapWork();
  }

  isComputing() {
    return !!this.work && !this.work.stopRequested;
  }
}
