import { setupPosition } from 'chessops/variant';
import { lichessRules } from 'chessops/compat';
import { makeSanAndPlay } from 'chessops/san';
import { parseUci } from 'chessops/util';
import { parseFen } from 'chessops/fen';
import { Text, Divider } from '@mantine/core';
import classes from '../css/move.module.css';

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

export const renderLine = (line) => {
  let turn, moves;
  const color = (ply) => ((ply - 1) % 2 === 0 ? 'white' : 'black');
  return line
    .map((move, index) => {
      turn = plyToTurn(move.ply);
      if (index == 0 && color(move.ply) === 'black') {
        moves = '... ' + move.san;
      } else if (color(move.ply) === 'white') {
        moves = move.san + ' ' + (line[index + 1]?.san ?? '');
      } else {
        return null;
      }
      return (
        <div className={classes.row} key={turn}>
          {turn + '. '}
          <Text className={classes.text}> {moves} </Text>
        </div>
      );
    })
    .filter((value) => value);
};

const plyToTurn = (ply) => Math.floor((ply - 1) / 2) + 1;
