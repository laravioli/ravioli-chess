import type { AnalyseConfig } from '@/core/boot/interface';
import { useGlobalStore, usePageInitCfg } from '@/core/hooks';
import { AnalyseStore } from './analyse';

export function useInitStore(): () => AnalyseStore {
  const { ceval, socketReceive } = useGlobalStore();
  const opts = usePageInitCfg() as AnalyseConfig;

  return () => new AnalyseStore(ceval, opts, { socketReceive });
}
