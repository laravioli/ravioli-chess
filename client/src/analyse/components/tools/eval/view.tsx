import { observer } from 'mobx-react-lite';
import classes from '@/analyse/css/eval.module.css';
import { EvalToggle, EvalScore, Depth } from './info';
import { Settings } from './settings';
import { usePageStore } from '@/core/hooks';
import { AnalyseStore } from '@/analyse/store/analyse';

export const Eval: React.FC = observer(() => {
  const store = usePageStore<AnalyseStore>();
  return (
    <div className={classes.eval}>
      <EvalToggle />
      <EvalScore />
      <span className={classes.info}>{store.engineInfo?.short}</span>
      <Depth />
      <Settings />
    </div>
  );
});
