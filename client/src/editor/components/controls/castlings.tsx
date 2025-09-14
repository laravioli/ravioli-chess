import { usePageStore } from 'src/main/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { Checkbox } from '@mantine/core';
import classes from '../../css/controls.module.css';
import type { EditorStore } from 'src/editor/store/editor';
import type { CastlingSide } from 'src/editor/store/interface';

export const CastlingBoxes = () => {
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

const CastlingBox = observer(({ id, label }: { id: CastlingSide; label: string }) => {
  const editorStore = usePageStore<EditorStore>();
  const castlingRight = editorStore.fen.castlings[id];

  const onChange = () => {
    editorStore.fen.setCastlingRight(id, !castlingRight);
  };

  return (
    <Checkbox
      checked={castlingRight}
      label={label}
      color="dark"
      variant="outline"
      radius="xs"
      onChange={onChange}
    />
  );
});
