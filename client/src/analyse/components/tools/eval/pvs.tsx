import React from 'react';
import { observer } from 'mobx-react-lite';
import { Position, setupPosition } from 'chessops/variant';
import { lichessRules } from 'chessops/compat';
import { makeSanAndPlay } from 'chessops/san';
import { parseUci } from 'chessops/util';
import { parseFen } from 'chessops/fen';
import { Text, Divider } from '@mantine/core';

import { useLocalStorage, usePageStore } from '@/core/hooks/hooks';
import { getEval } from '@/lib/eval/utils';

import type { AnalyseStore } from '@/analyse/store/analyse';
import type { LocalEval, PvData, Uci } from '@/lib/eval/interface';
import classes from '@/analyse/css/eval.module.css';

export const Pvs: React.FC = observer(() => {
  const analyseStore = usePageStore<AnalyseStore>();
  const multipv = useLocalStorage().evalStorage.multipv;
  return (
    <>
      {analyseStore.ceval.enabled &&
        !analyseStore.node.outcome &&
        renderPvs(analyseStore.node.ceval, multipv)}
    </>
  );
});

const MAX_NUM_MOVES = 12;

function parsePv(moves: Uci[], pos?: Position) {
  const nb = Math.min(MAX_NUM_MOVES, moves.length);
  const result: string[] = [];
  if (pos) {
    for (let i = 0; i < nb; i++) {
      if (pos.turn === 'white') result.push(`${pos.fullmoves}.`);
      else if (i === 0) result.push(`${pos.fullmoves}...`);
      const uci = moves[i];
      const san = makeSanAndPlay(pos, parseUci(uci)!);
      if (san === '--') break;
      result.push(san);
    }
  }
  return result.join(' ');
}

interface Pv {
  moves?: string;
  eval?: PvData;
}

function renderPvs(evaluation: LocalEval | undefined, multipv: number) {
  let pvs: Pv[];
  if (!evaluation) pvs = new Array(multipv).fill({});
  else {
    const setup = parseFen(evaluation.fen).unwrap();
    const pos = setupPosition(lichessRules('standard'), setup);
    pvs = Array.from({ length: multipv }, (_, i) => {
      const pvData = evaluation.pvs?.[i];
      if (!pvData || !pos) return {};
      return {
        moves: parsePv(pvData.moves, pos.isOk ? pos.value.clone() : undefined),
        eval: pvData,
      };
    });
  }
  return (
    <>
      {pvs.map((pv, index) => (
        <React.Fragment key={index}>
          <Text classNames={{ root: classes.pvs }} lineClamp={1}>
            {multipv > 1 && (
              <span style={{ opacity: 0.6, marginRight: 6 }}>{pv.eval && getEval(pv.eval)}</span>
            )}
            {pv.moves}
          </Text>
          <Divider classNames={{ root: classes.divider }} />
        </React.Fragment>
      ))}
    </>
  );
}
