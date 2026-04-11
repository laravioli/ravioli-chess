import { usePageInitCfg } from '@/core/hooks';
import type { EditorConfig } from '@/core/boot/interface';

import { EditorStore } from './editor';

export function useInitStore(): () => EditorStore {
  const cfg = usePageInitCfg() as EditorConfig;

  return () => new EditorStore(cfg);
}
