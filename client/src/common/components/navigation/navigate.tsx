import { usePageStore } from 'src/main/hooks/hooks';
import { useNavigate } from 'react-router';
import { observer } from 'mobx-react-lite';
import { Action } from '../controls/action';
import { IconMathMaxMin, IconEdit } from '@tabler/icons-react';
import { action } from 'mobx';
import { INITIAL_FEN } from 'chessops/fen';
import type { FloatingPosition } from '@mantine/core';
import { EditorStore } from 'src/editor/store/editor';
import type { AnalyseStore } from 'src/analyse/store/analyse';
import type { AnalyseOpts } from 'src/analyse/store/interface';
import type { EditorOpts } from 'src/editor/store/interface';

interface NavigateProps {
  ttposition: FloatingPosition;
  path: string;
  getFen: () => FEN;
}

type NavigationState = AnalyseOpts | EditorOpts;

export const Navigate = observer(({ ttposition, path, getFen }: NavigateProps) => {
  const pageStore = usePageStore<AnalyseStore | EditorStore>();
  const navigate = useNavigate();
  const isEdit = pageStore instanceof EditorStore;
  const label = isEdit ? 'analysis board' : 'edit board';
  const Icon = isEdit ? IconMathMaxMin : IconEdit;
  const disabled = isEdit && !pageStore.fen.legalFen;

  const onClick = action(() => {
    if (!isEdit || pageStore.fen.legalFen) {
      const state: NavigationState = {
        fen: getFen() || INITIAL_FEN,
        orientation: pageStore.board!.state.orientation,
      };
      navigate(path, {
        replace: true,
        state,
      });
    }
  });

  return (
    <Action label={label} onClick={onClick} ttposition={ttposition} disabled={disabled}>
      <Icon size={30} stroke={1.2} />
    </Action>
  );
});
