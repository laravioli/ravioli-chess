const pieceVars = [
  ['---white-pawn', 'wP'],
  ['---black-pawn', 'bP'],
  ['---white-knight', 'wN'],
  ['---black-knight', 'bN'],
  ['---white-bishop', 'wB'],
  ['---black-bishop', 'bB'],
  ['---white-rook', 'wR'],
  ['---black-rook', 'bR'],
  ['---white-queen', 'wQ'],
  ['---black-queen', 'bQ'],
  ['---white-king', 'wK'],
  ['---black-king', 'bK'],
];

function getImageUrl(theme: string, piece: string) {
  const base = import.meta.env.BASE_URL;
  return `${base.replace(/\/+$/, '')}/images/pieces/${theme}/${piece}.png`;
}

export function pieceVarRules(theme: string) {
  for (const [varName, fileName] of pieceVars) {
    const url = getImageUrl(theme, fileName);
    document.body.style.setProperty(varName, `url(${url})`);
  }
}

export function setBoardColor(color: string) {
  document.body.dataset['board'] = color;
}
