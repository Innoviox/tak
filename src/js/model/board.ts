export const enum Color {White = 1, Black = 2};
export const enum Stone {Flat = 'F', Stand = 'S', Cap = 'C'};

export interface Position {
  x: number;
  y: number;
}

export interface Tile {
  color: Color;
  stone: Stone;
  pos: Position
}

export class Square {
  pos: Position
  tiles: Array<Tile>;

  constructor(pos: Position, tiles?: Array<Tile>) {
    this.pos = pos
    this.tiles = tiles && new Array<Tile>();
  }

  add(tile: Tile) {
    if (this.tiles && this.tiles[-1].stone == Stone.Flat) {
      this.tiles.push(tile);
    } else {
      //TODO: tile is not flat
    }
  }
}

export class Board {
  size: number;
  board: Square[][];

  constructor(public s: number) {
    this.size = s;
    this.board = Square[s][s];
  }

  addTile(pos: Position, tile: Tile): void {
    this.board[pos.x][pos.y].tiles.push(tile);
  }
}
