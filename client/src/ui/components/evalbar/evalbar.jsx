import styles from './evalbar.module.css';
import { useModule } from '../../context/hooks';
import { evalStore } from 'src/stores';
import { useEffect, useState } from 'react';

//todo : improve susbcribe event (when i disable, he dont trigger on the concerned tab)

export const EvalBar = () => {
  const analyse = useModule();
  const [visible, setVisible] = useState(analyse.ceval.enabled());

  useEffect(() => {
    const callback = () => {
      const enabled = !!window.sessionStorage.getItem('ceval.enabled-after');
      console.log(enabled);
      setVisible(enabled);
    };
    const unsub = evalStore.subscribe((state) => state.disable, callback);
    return unsub;
  }, []);

  if (!visible) return null;
  return (
    <div className={[styles.evalbar, styles.black].join(' ')}>
      <div className={styles.white} style={{ height: '50%' }}></div>
    </div>
  );
};
