import { observer } from 'mobx-react-lite';
import { TextInput } from '@mantine/core';

import { usePageStore } from '@/core/hooks/hooks';
import classes from '@/common/css/fen.module.css';

import type { AnalyseStore } from '@/analyse/store/analyse';

export const FenInput: React.FC = observer(() => {
  const analyseStore = usePageStore<AnalyseStore>();

  return (
    <TextInput
      value={analyseStore.node.fen}
      leftSectionPointerEvents="none"
      leftSection="FEN"
      variant="filled"
      readOnly
      classNames={{ root: classes.root, input: classes.input }}
    />
  );
});
