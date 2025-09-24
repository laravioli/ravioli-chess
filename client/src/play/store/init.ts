import { useGlobalStore, usePageInitCfg } from 'src/main/hooks/hooks';
import { PlayStore } from './play';
import type { PlayConfig } from 'src/main/boot/interface';

export function useInitStore(): () => PlayStore {
  const globalStore = useGlobalStore();
  const cfg = usePageInitCfg() as PlayConfig;

  return () => new PlayStore(globalStore, cfg);
}
