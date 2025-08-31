import { Board, IAction, IBoard, IBoardState, IMineCell } from "../utils/board";
import { TIME_CHANGE } from "../actions/types";

export {
  difficultyChanged,
  heightChanged,
  widthChanged,
  remainingChanged,
  changeRemaining,
  timeChanged,
  timerStart,
  startTimer,
  timerStop,
  stopTimer,
  cellClicked,
  cellDoubleClicked,
  cellRightClicked,
  notificationConfirmed,
  changeGameStatus,
  saveClicked,
  loadClicked,
  boardLoad
} from "../actions/actions";
export { difficultySelectorReducer } from "./difficultySelectorReducer";
export { endGameReducer } from "./endGameReducer";
export { mineBoardReducer } from "./mineBoardReducer";
export { scoreboardReducer } from "./scoreboardReducer";

export function logCells(cells: IMineCell[] | IBoardState | IBoard): void {
  if ((cells as IBoardState)?.mineBoard?.cells) {
    return logCells((cells as IBoardState).mineBoard.cells);
  }
  if ((cells as IBoardState)?.cells) {
    return logCells((cells as IBoardState).cells as IMineCell[]);
  }
  if (Array.isArray(cells) && cells.length) {
    console.table(cells);
  }
}

const originalLog = console.log;
console.log = (...args: unknown[]) => {
  originalLog.apply(null, ["", ...args.filter(arg => typeof arg !== "object")]);
  args.filter(arg => typeof arg === "object" && arg !== null).forEach(arg => logCells(arg as IMineCell[] | IBoardState | IBoard));
};

export interface BoardDifficulty {
  difficulty: string;
  width: number;
  height: number;
}

export function getBoardDifficulty({
  difficulty,
  width,
  height
}: BoardDifficulty): BoardDifficulty {
  const pheight =
    difficulty === "?" ? +height : difficulty === "30" ? 16 : +difficulty;
  const pwidth = difficulty === "?" ? +width : +difficulty;
  return {
    difficulty,
    width: pwidth,
    height: pheight
  };
}

export function buildBoardState(
  state: IBoardState,
  action: IAction
): { boardFromState: boolean; newState: IBoard & Record<string, unknown> } {
  const board: IBoard = (action.mineBoard ?? state.mineBoard ?? state) as IBoard;
  const boardFromState = !action.mineBoard && !state.mineBoard;
  const { difficulty, width, height } = getBoardDifficulty({
    difficulty: action?.difficulty ?? board?.difficulty,
    height: action?.height ?? board?.height,
    width: action?.width ?? board?.width
  });
  let cells = [...board.cells];
  if (difficulty !== board.difficulty || cells.length === 0) {
    const newBoard = new Board(width, height);
    newBoard.buildBoard();
    cells = newBoard.cells;
  }
  const stateFromBoard: IBoard = {
    ...state,
    ...board,
    cells
  };
  const boardState: IBoard = {
    ...state,
    difficulty,
    width,
    height,
    cells
  };
  if (action.type !== TIME_CHANGE) {
    console.log(
      "buildBoardState: ",
      boardFromState,
      { ...stateFromBoard, cells: [],  },
      boardState
    );
  }
  const newState = boardFromState ? stateFromBoard : boardState;
  return { boardFromState, newState };
}
