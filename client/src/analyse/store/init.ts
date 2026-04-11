import { useGlobalStore, usePageInitCfg } from '@/core/hooks';
import type { AnalyseConfig } from '@/core/boot/interface';

import { AnalyseStore } from './analyse';

export function useInitStore(): () => AnalyseStore {
  const { ceval } = useGlobalStore();
  const cfg = usePageInitCfg() as AnalyseConfig;

  return () => new AnalyseStore(ceval, cfg);
}
