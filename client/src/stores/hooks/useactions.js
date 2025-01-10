import { useShallow } from 'zustand/shallow';
import { useBoundStore } from './useboundstore';

export const useBoardActions = () => {
  return useBoundStore(
    useShallow((state) => ({
      startBoard: state.startBoard,
      clearBoard: state.clearBoard,
      flipBoard: state.flipBoard,
      boardPosition: state.boardPosition,
    }))
  );
};

export const useGameActions = () => {
  return useBoundStore(
    useShallow((state) => ({
      newGame: state.newGame,
      clearGame: state.clearGame,
    }))
  );
};
