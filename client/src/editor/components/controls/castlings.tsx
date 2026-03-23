import { observer } from 'mobx-react-lite';
import { Checkbox } from '@mantine/core';

import { usePageStore } from '@/core/hooks/hooks';

import classes from '@/editor/css/controls.module.css';
import type { EditorStore } from '@/editor/store/editor';
import type { CastlingSide } from '@/editor/store/interface';

export const CastlingBoxes: React.FC = () => {
  const labels = ['O-O', 'O-O-O', 'o-o', 'o-o-o'];
  return (
    <>
      <div className={classes.castle}>
        {(['K', 'Q', 'k', 'q'] as const).map((item, index) => (
          <CastlingBox key={item} id={item} label={labels[index]} />
        ))}
      </div>
    </>
  );
};

const CastlingBox: React.FC<{ id: CastlingSide; label: string }> = observer(({ id, label }) => {
  const editorStore = usePageStore<EditorStore>();
  const castlingRight = editorStore.fen.castlings[id];

  const onChange = () => {
    editorStore.fen.setCastlingRight(id, !castlingRight);
  };

  return (
    <Checkbox
      classNames={{ input: classes.checkbox }}
      checked={castlingRight}
      label={label}
      variant="outline"
      radius="xs"
      onChange={onChange}
    />
  );
});
