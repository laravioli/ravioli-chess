import { useGlobalStore, useInitCfg } from 'src/main/hooks/hooks';
import { AnalyseStore } from './analyse';

export function useInitStore(): () => AnalyseStore {
  const { ceval } = useGlobalStore();
  const cfg = useInitCfg();

  return () => new AnalyseStore(ceval, cfg);
}
