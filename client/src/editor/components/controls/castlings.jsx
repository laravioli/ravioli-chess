import { useStore } from 'src/main/hooks/hooks';
import { observer } from 'mobx-react-lite';
import { Checkbox } from '@mantine/core';
import classes from './controls.module.css';

export const CastlingBoxes = () => {
  const labels = ['O-O', 'O-O-O', 'o-o', 'o-o-o'];
  return (
    <>
      <div className={classes.castle}>
        {['K', 'Q', 'k', 'q'].map((item, index) => (
          <CastlingBox key={item} id={item} label={labels[index]} />
        ))}
      </div>
    </>
  );
};

const CastlingBox = observer(({ id, label }) => {
  const { fenStore } = useStore();
  const castlingRight = fenStore.castling[id];

  const onChange = () => {
    fenStore.setCastlingRight(id, !castlingRight);
  };

  return (
    <Checkbox
      checked={castlingRight}
      label={label}
      color="gray"
      variant="outline"
      radius="xs"
      onChange={onChange}
    />
  );
});
