import {
  DIFFICULTY_CHANGE,
  DIFFICULTY_HEIGHT_CHANGE,
  DIFFICULTY_WIDTH_CHANGE,
  SAVE_CLICKED,
  LOAD_CLICKED,
  BOARD_CLICKED,
  TIME_CHANGE
} from "../actions/types";
import { buildBoardState } from ".";
import { TypedStorage } from "../utils/storage";
import { IAction, IBoard, IBoardState } from "../utils/board";

export interface IInitialState {
  boards: IBoard[];
  mineBoard: IBoard;
}

const initialState: IInitialState & Record<string, unknown> = {
  boards: [],
  mineBoard: {
    difficulty: "9",
    width: 9,
    height: 9,
    cells: []
  }
};

const store = new TypedStorage<IBoard>();

export function transformBoardStateToInitialState(state: IBoardState & Record<string, unknown>): IInitialState & Record<string, unknown> {
  const boards: IBoard[] = state.mineBoard.cells.length
    ? [state.mineBoard]
    : Array.isArray(state.boards) ? state.boards : [];
  return {
    boards,
    mineBoard: state.mineBoard
  };
}

export function transformInitialStateToBoardState(state: IInitialState & Record<string, unknown>): IBoardState & Record<string, unknown> {
  const boards: IBoard[] = state.boards.length
    ? state.boards
    : Array.isArray(state.boards) ? state.boards : [];
  return {
    mineBoard: boards.length ? boards[0] : state.mineBoard,
    difficultySelector: {
      difficulty: state.mineBoard.difficulty,
      height: state.mineBoard.height,
      width: state.mineBoard.width
    },
    endGame: {
      status: "won"
    },
    scoreboard: {
      time: "00:00",
      timeRunning: false,
      remaining: 0
    },
    cell: {
      clickCount: 0,
      flag: false,
      hidden: false,
      index: 0,
      value: 0,
      key: "x0y0",
      x: 0,
      y: 0
    },
    cells: []
  };
}

export function difficultySelectorReducer(state = initialState, action: IAction) {
  if (action.type !== TIME_CHANGE) {
    console.log(
      "difficultySelectorReducer",
      { ...state, cells: [], mineBoard: { cells: [] } },
      action
    );
  }
  const otherState: IBoardState = { 
    difficultySelector: { 
      difficulty: state.mineBoard.difficulty, 
      height: state.mineBoard.height, 
      width: state.mineBoard.width 
    }, 
    mineBoard: state.mineBoard, 
    scoreboard: { 
      remaining: 0, 
      time: "00:00", 
      timeRunning: false 
    }, 
    endGame: {  
      status: "playing" 
    } 
  };
  const { boardFromState, newState } = buildBoardState(otherState, action);
  let board: { newState: IBoard & Record<string, unknown>; boardFromState: boolean };
  switch (action.type) {
    case DIFFICULTY_CHANGE:
    case DIFFICULTY_WIDTH_CHANGE:
    case DIFFICULTY_HEIGHT_CHANGE:
      if (boardFromState && newState.difficulty !== state.mineBoard.difficulty) {
        return newState;
      }
      return { ...state };
    case SAVE_CLICKED:
      store.save(null, newState);
      return newState;
    case LOAD_CLICKED:
      if (!Object.keys(newState).includes('boards')) {
        newState['boards'] = Array.from(store.keys.values())
        .filter(key => /^board\d{5}$/.test(key))
        .map((k: string) => {
          return {
            key: k
          };
        });
      }
      return newState;
    case BOARD_CLICKED:
      action.mineBoard = store.get(action.key?.key ?? '') as IBoard;
      board = buildBoardState(transformInitialStateToBoardState(state), action);
      board.newState.boards = null;
      return { ...state, ...board.newState };
    default:
      if (Array.isArray(newState.boards) && newState.boards.length) {
        if (action.type !== TIME_CHANGE) {
          console.log("difficultySelectorReducer: default: ", newState, action);
        }
        return newState;
      }
      if (action.type !== TIME_CHANGE) {
        console.log(
          "difficultySelectorReducer: default: ",
          { ...state },
          action
        );
      }
      return { ...state };
  }
}
