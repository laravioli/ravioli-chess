import { useQueryClient } from '@tanstack/react-query';
import { useGlobalStore, usePageInitCfg } from '@/core/hooks';
import { globalHandlers } from '@/core/socket';
import type { AnalyseConfig } from '@/core/boot/interface';
import { AnalyseStore } from './analyse';

export function useInitStore(): () => AnalyseStore {
  const { ceval } = useGlobalStore();
  const queryClient = useQueryClient();
  const opts = usePageInitCfg() as AnalyseConfig;
  const socketReceive = globalHandlers(queryClient);

  return () => new AnalyseStore(ceval, opts, { socketReceive });
}
