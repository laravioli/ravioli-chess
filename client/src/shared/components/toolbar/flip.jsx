import { useModule } from 'src/shared/hooks/hooks';
import { CButton } from './button';

export const FlipButton = () => {
  const module = useModule();
  const onFlip = () => module.getBoard().flip();

  return <CButton label="flip board" onClick={onFlip} />;
};
