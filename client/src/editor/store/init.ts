import { useInitCfg } from 'src/main/hooks/hooks';
import { EditorStore } from './editor';

export function useInitStore(): () => EditorStore {
  const cfg = useInitCfg();

  return () => new EditorStore(cfg);
}
