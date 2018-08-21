class Tile {
  color: string;
  stone: string;
  x: number;
  y: number;
}

class Square {
  x: number;
  y: number;
  tiles: Tile[];
}

class Board {
  size: number;
  board: Square[][];
  constructor(public s: number) {
    this.size = s;
    this.board = Square[s][s];
  }
}
