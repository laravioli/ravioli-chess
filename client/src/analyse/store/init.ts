import { useGlobalStore, usePageInitCfg } from 'src/main/hooks/hooks';
import { AnalyseStore } from './analyse';
import type { AnalyseConfig } from 'src/main/boot/interface';

export function useInitStore(): () => AnalyseStore {
  const { ceval } = useGlobalStore();
  const cfg = usePageInitCfg() as AnalyseConfig;

  return () => new AnalyseStore(ceval, cfg);
}
