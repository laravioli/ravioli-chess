import { setupPosition } from 'chessops/variant';
import { lichessRules } from 'chessops/compat';
import { makeSanAndPlay } from 'chessops/san';
import { parseUci } from 'chessops/util';
import { parseFen } from 'chessops/fen';
import { Text, Divider } from '@mantine/core';

const MAX_NUM_MOVES = 12;

function parsePv(pos, pv) {
  const nb = Math.min(MAX_NUM_MOVES, pv.length);
  const result = [];
  for (let i = 0; i < nb; i++) {
    if (pos.turn === 'white') result.push(`${pos.fullmoves}.`);
    else if (i === 0) result.push(`${pos.fullmoves}...`);
    const uci = pv[i];
    const san = makeSanAndPlay(pos, parseUci(uci));
    if (san === '--') break;
    result.push(san);
  }
  return result.join(' ');
}

export function renderPvs(evaluation) {
  if (!evaluation) return '';
  const setup = parseFen(evaluation.fen).unwrap();
  const pos = setupPosition(lichessRules('standard'), setup);
  const pv = pos
    ? parsePv(pos.isOk ? pos.value.clone() : undefined, evaluation.pvs[0].moves)
    : '';

  return (
    <>
      <Text size="sm" lineClamp={1}>
        {pv}
      </Text>
      <Divider my="xs" />
    </>
  );
}

const plyToTurn = (ply) => Math.floor((ply - 1) / 2) + 1;

export function renderMoves(moves) {}
