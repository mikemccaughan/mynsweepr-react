import { Temporal } from './temporal.d';

export interface IMineCell {
  value?: number;
  index?: number;
  key?: string;
  x?: number;
  y?: number;
  hidden?: boolean;
  flag?: boolean;
  clickCount?: number;
}
export interface IBoard {
  difficulty: string;
  width: number;
  height: number;
  cells: IMineCell[];
}
export interface IAction {
  cell?: IMineCell;
  cells?: IMineCell[];
  type?: string;
  status?: string;
  timerId?: number;
  time?: number | string;
  remaining?: number;
  key?: { key: string };
  mineBoard?: IBoard;
  difficulty?: string;
  width?: number;
  height?: number;
}

export interface IBoardState {
  mineBoard: {
    difficulty: string;
    width: number;
    height: number;
    cells: IMineCell[];
  },
  difficultySelector: {
    difficulty: string;
    width: number;
    height: number;
  },
  scoreboard: {
    time: string;
    timeRunning: boolean;
    remaining: number;
  },
  endGame: {
    status: string;
  },
  cell?: IMineCell;
  cells?: IMineCell[];
}
export class Board implements IBoard {
  difficulty: string;
  width: number;
  height: number;
  cells: IMineCell[];
  private preboard: number[][] = [];
  constructor();
  constructor(width: string | number, height: string | number);
  constructor(board: IBoard);
  constructor(
    boardOrWidth?: IBoard | string | number,
    height?: string | number
  ) {
    let board: IBoard = { difficulty: "9", width: 9, height: 9, cells: [] };
    if (Utils.isGood(boardOrWidth) && typeof boardOrWidth === 'object' && Object.hasOwn(boardOrWidth, "width")) {
      board = boardOrWidth as IBoard;
    }
    if (boardOrWidth != null && typeof height !== "undefined") {
      board = {
        difficulty:
          +boardOrWidth === 9 && +height === 9
            ? "9"
            : +boardOrWidth === 16 && +height === 16
              ? "16"
              : +boardOrWidth === 30 && +height === 16 ? '30' : '?',
        width: +boardOrWidth,
        height: +height,
        cells: []
      };
    }
    this.difficulty = board.difficulty;
    this.width = board.width;
    this.height = board.height;
    this.cells = board.cells;
  }
  exportBoard(): string {
    return JSON.stringify(this);
  }
  importBoard(boardJson: string) {
    const board = JSON.parse(boardJson);
    this.width = board.width;
    this.height = board.height;
    this.cells = board.cells;
    this.sortCells();
  }
  private sortCells(): void {
    const isNotSorted = this.cells.some((c, i) => c.index !== i);
    if (isNotSorted) {
      this.cells = this.cells.sort((a, b) => (a.index || 0) - (b.index || 0));
    }
  }
  private static createCell(
    x: number,
    y: number,
    value: number,
    index: number,
    clickCount?: number,
    hidden?: boolean,
    flag?: boolean
  ): IMineCell {
    hidden = typeof hidden === "boolean" ? hidden : true;
    flag = typeof flag === "boolean" ? flag : false;
    const key = `${x}.${y}.${value}`;
    return {
      key: key,
      value: value,
      x: x,
      y: y,
      index: index,
      clickCount: clickCount || 0,
      hidden: hidden,
      flag: flag
    };
  }
  private initPreboard(): void {
    this.preboard = Array.from(new Array(this.height), (v, i) => new Array(this.width).fill(0));

    const pb: number[][] = [];
    for (let y = 0; y < this.height; y++) {
      pb[y] = [];
      for (let x = 0; x < this.width; x++) {
        pb[y][x] = 0;
      }
    }


  }
  private populatePreboard(): void {
    const cellCount = this.width * this.height;
    const mineCount = Math.floor(cellCount / 6);
    const value = -(mineCount * 2);
    const isBetween = function (value: number, min: number, max: number): boolean {
      return value >= min && value <= max;
    };
    for (let i = 0; i < mineCount; i++) {
      let x: number, y: number;
      do {
        x = Math.floor(Math.random() * this.width);
        y = Math.floor(Math.random() * this.height);
        if (0 <= this.preboard[y][x]) {
          break;
        }
      } while (i >= 0);
      for (let m = -1; m < 2; m++) {
        for (let n = -1; n < 2; n++) {
          if (n === 0 && m === 0) {
            this.preboard[y][x] = value;
          } else if (
            isBetween(y + n, 0, this.height - 1) &&
            isBetween(x + m, 0, this.width - 1)
          ) {
            this.preboard[y + n][x + m]++;
          }
        }
      }
    }
  }
  private buildCells(): void {
    this.cells = [];
    let cellIndex = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.cells[cellIndex] = Board.createCell(
          x,
          y,
          this.preboard[y][x],
          cellIndex
        );
        cellIndex++;
      }
    }
  }
  public buildBoard(): void {
    this.cells = [];
    this.initPreboard();
    this.populatePreboard();
    this.buildCells();
    this.sortCells();
  }
  public static getRemaining(cells: IMineCell[]): number {
    const mines = cells.filter(cell => (cell.value || 0) < 0 && !cell.flag);
    return mines.length;
  }
}
export class Utils {
  static areEqual(a: unknown, b: unknown, deep: boolean): boolean {
    if (Object.is(a, b)) {
      return true;
    }
    if (typeof a !== typeof b) {
      return false;
    }
    switch (typeof a) {
      case 'object':
        if (a instanceof Date && b instanceof Date) {
          return a.valueOf() === b.valueOf();
        } else if (Utils.isGood(Temporal) && (
          a instanceof Temporal.PlainDateTime ||
          a instanceof Temporal.ZonedDateTime ||
          a instanceof Temporal.Instant ||
          b instanceof Temporal.PlainDateTime ||
          b instanceof Temporal.ZonedDateTime ||
          b instanceof Temporal.Instant
        )) {
          if (a instanceof Date && (
            b instanceof Temporal.PlainDateTime ||
            b instanceof Temporal.ZonedDateTime ||
            b instanceof Temporal.Instant
          )) {
            return a.valueOf() === b.valueOf();
          } else if (b instanceof Date && (
            a instanceof Temporal.PlainDateTime ||
            a instanceof Temporal.ZonedDateTime ||
            a instanceof Temporal.Instant
          )) {
            return a.valueOf() === b.valueOf();
          } else if ((
            a instanceof Temporal.PlainDateTime ||
            a instanceof Temporal.ZonedDateTime ||
            a instanceof Temporal.Instant
          ) && (
              b instanceof Temporal.PlainDateTime ||
              b instanceof Temporal.ZonedDateTime ||
              b instanceof Temporal.Instant
            )) {
            return a.valueOf() === b.valueOf();
          }
        } else if (Array.isArray(a) && Array.isArray(b)) {
          if (a.length !== b.length) {
            return false;
          }
          // Array positions may differ if deep == false
          return deep ?
            a.every((elA, i) => Utils.areEqual(elA, b[i], deep)) :
            a.every((elA) => b.some((elB) => Utils.areEqual(elA, elB, deep)));
        } else if (a instanceof RegExp && b instanceof RegExp) {
          // There are edge cases where this would not work
          return a.toString() === b.toString(); 
        } else if (a != null && b != null) {
          const entriesA = Object.entries(a);
          const entriesB = Object.entries(b);
          // if a primitive is wrapped in an object (e.g. Object(1)), Object.entries(obj) returns [].
          if (entriesA.length === 0 && entriesB.length === 0) {
            // The primitive value can be retrieved via valueOf()
            const valueA = a.valueOf();
            const valueB = b.valueOf();
            return Utils.areEqual(valueA, valueB, deep);
          }
          return Utils.areEqual(entriesA, entriesB, deep);
        } else {
          return false;
        }
        break;
      case 'bigint':
        // bigint support in Object.is is unknown
        return a === b;
      case 'symbol':
        if (typeof b === 'symbol') {
          // Symbols are like objects; they use reference equality, but they only have
          // one property.
          return a.description === b.description;
        }
      return false;
    }
    return a === b;
  }
  static isGood(value: unknown, min?: number, max?: number): value is string | number | bigint | boolean | object {
    if (typeof value === 'number') {
      if (typeof min === 'number' && typeof max === 'number') {
        return value >= min && value <= max;
      } else if (typeof min === 'number') {
        return value >= min;
      } else if (typeof max === 'number') {
        return value <= max;
      }
      return true;
    }
    else if (typeof value === 'bigint') {
      if (typeof min === 'bigint' && typeof max === 'bigint') {
        return value >= min && value <= max;
      } else if (typeof min === 'bigint') {
        return value >= min;
      } else if (typeof max === 'bigint') {
        return value <= max;
      }
      return true;
    }
    else if (typeof value === 'string') {
      const len = value.trim().length;
      if (len <= 0) {
        return false;
      }
      if (typeof min === 'number' && typeof max === 'number') {
        return len >= min && len <= max;
      } else if (typeof min === 'number') {
        return len >= min;
      } else if (typeof max === 'number') {
        return len <= max;
      }
    }
      
    return typeof value !== 'undefined' && value !== null;
  }
  static isOfType(value: unknown, type: string): boolean {
    if (typeof value === 'object' && value !== null) {
      return value.constructor.name.toLowerCase() === type.toLowerCase();
    }
    return typeof value === type;
  }
}