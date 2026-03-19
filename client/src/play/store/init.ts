import { useGlobalStore, usePageInitCfg } from '@/core/hooks/hooks';
import type { PlayConfig } from '@/core/boot/interface';

import { PlayStore } from './play';

export function useInitStore(): () => PlayStore {
  const globalStore = useGlobalStore();
  const cfg = usePageInitCfg() as PlayConfig;

  return () => new PlayStore(globalStore, cfg);
}
