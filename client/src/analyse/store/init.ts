import { useGlobalStore, usePageInitCfg } from '@/core/hooks';
import type { AnalyseConfig } from '@/core/boot/interface';
import { AnalyseStore } from './analyse';

export function useInitStore(): () => AnalyseStore {
  const { ceval, socketReceive } = useGlobalStore();
  const opts = usePageInitCfg() as AnalyseConfig;

  return () => new AnalyseStore(ceval, opts, { socketReceive });
}
