import { useGlobalStore, useInitCfg } from 'src/main/hooks/hooks';
import { PlayStore } from './play';

export function useInitStore(): () => PlayStore {
  const globalStore = useGlobalStore();
  const cfg = useInitCfg();

  return () => new PlayStore(globalStore, cfg);
}
