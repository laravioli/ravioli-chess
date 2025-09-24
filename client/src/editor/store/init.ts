import { usePageInitCfg } from 'src/main/hooks/hooks';
import { EditorStore } from './editor';
import type { EditorConfig } from 'src/main/boot/interface';

export function useInitStore(): () => EditorStore {
  const cfg = usePageInitCfg() as EditorConfig;

  return () => new EditorStore(cfg);
}
