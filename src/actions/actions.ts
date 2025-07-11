import {
  DIFFICULTY_CHANGE,
  DIFFICULTY_WIDTH_CHANGE,
  DIFFICULTY_HEIGHT_CHANGE,
  REMAINING_CHANGE,
  TIME_CHANGE,
  CELL_CLICKED,
  CELL_DOUBLE_CLICKED,
  CELL_RIGHT_CLICKED,
  GAME_LOST,
  GAME_WON,
  NOTIFICATION_CONFIRMED,
  TIMER_START,
  TIMER_STOP,
  SAVE_CLICKED,
  LOAD_CLICKED,
  BOARD_CLICKED
} from "./types";
import { IMineCell, Board, IAction } from "../utils/board";
import { Timer } from "..";

export type IDispatchFn = (dispatch: (...args: any[]) => void, getState: () => any, timer?: Timer) => void;

export function difficultyChanged(difficulty: string | undefined): IAction {
  return { type: DIFFICULTY_CHANGE, difficulty };
}
export function widthChanged(width: number): IAction {
  return { type: DIFFICULTY_WIDTH_CHANGE, width };
}
export function heightChanged(height: number): IAction {
  return { type: DIFFICULTY_HEIGHT_CHANGE, height };
}
export function saveClicked(mineBoard?: Board): IAction {
  return { type: SAVE_CLICKED, mineBoard };
}
export function loadClicked(mineBoard?: Board): IAction {
  return { type: LOAD_CLICKED, mineBoard };
}
export function boardLoad(key: { key: string }): IAction {
  return { type: BOARD_CLICKED, key };
}
export function remainingChanged(remaining: number | undefined): IAction {
  return { type: REMAINING_CHANGE, remaining };
}
export function changeRemaining(remaining?: number): IDispatchFn {
  return (
    dispatch: (...args: any[]) => void, 
    getState: () => any
  ) => {
    const state = getState();
    const remainFromState =
      (state.mineBoard?.cells?.length ?? 0) &&
      Board.getRemaining(state.mineBoard.cells);
    const remain = remaining ?? remainFromState ?? state.scoreboard.remaining;
    dispatch(remainingChanged(remain));
  };
}
export function timeChanged(
  time: number | string | undefined,
  status?: string
): IAction {
  return { type: TIME_CHANGE, time, status };
}
export function startTimer(timerId?: number): IAction {
  return { type: TIMER_START, timerId };
}
export function timerStart(timerId?: number): IDispatchFn {
  return (
    dispatch: (...args: any[]) => void,
    getState: () => any,
    timer?: Timer
  ) => {
    const state = getState();
    const existingTimerId = timerId || state.scoreboard.timerId;
    const newTimerId = timer?.start(
      (time: string) => dispatch(timeChanged(time, state.endGame.status)),
      existingTimerId
    );
    dispatch(startTimer(newTimerId));
  };
}
export function stopTimer(timerId: number): IAction {
  return { type: TIMER_STOP, timerId };
}
export function timerStop(timerId?: number): IDispatchFn {
  return (
    dispatch: (...args: any[]) => void,
    getState: () => any,
    timer?: Timer
  ) => {
    const state = getState();
    const existingTimerId = timerId || state.scoreboard.timerId;
    dispatch(timeChanged("00:00:00", state.endGame.status));
    timer?.stop(existingTimerId);
  };
}
export function cellClicked(cell: IMineCell | undefined): IAction {
  return { type: CELL_CLICKED, cell };
}
export function cellDoubleClicked(cell: IMineCell | undefined): IAction {
  return { type: CELL_DOUBLE_CLICKED, cell };
}
export function cellRightClicked(cell: IMineCell | undefined): IAction {
  return { type: CELL_RIGHT_CLICKED, cell };
}
export function changeGameStatus(status?: string): IDispatchFn {
  return (
    dispatch: (...args: any[]) => void, 
    getState: () => any
  ) => {
    const state = getState();
    const remainFromState = (state.mineBoard?.cells?.length ?? 0) &&
      Board.getRemaining(state.mineBoard.cells);
    status = status || state.endGame.status;
    if (
      !status &&
      !state.mineBoard.cells.some(
        (cell: IMineCell) => cell.hidden && !cell.flag
      )
    ) {
      status = remainFromState === 0 ? "won" : "lost";
    }

    switch (status) {
      case "lost":
        dispatch(gameLost());
        dispatch(timerStop());
        break;
      case "won":
        dispatch(gameWon());
        dispatch(timerStop());
        break;
    }
  };
}
export function gameLost(): IAction {
  return { type: GAME_LOST, status: "lost" };
}
export function gameWon(): IAction {
  return { type: GAME_WON, status: "won" };
}
export function notificationConfirmed(): IAction {
  return { type: NOTIFICATION_CONFIRMED };
}
