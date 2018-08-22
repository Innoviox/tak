import {LinkedList} from 'typescript-collections';

const enum Color {White = 1, Black = 2};
const enum Stone {Flat = 'F', Stand = 'S', Cap = 'C'};

interface Position {
  x: number;
  y: number;
}

interface Tile {
  color: Color;
  stone: Stone;
  pos: Position
}

class Square {
  pos: Position
  tiles: LinkedList<Tile>;

  constructor(pos: Position, tiles?: LinkedList<Tile>) {
    this.pos = pos
    this.tiles = tiles && new LinkedList<Tile>();
  }

  add(tile: Tile) {
    if (this.tiles && this.tiles.last().stone == Stone.Flat) {
      this.tiles.add(tile);
    } else {
      //TODO: tile is not flat
    }
  }
}

class Board {
  size: number;
  board: Square[][];

  constructor(public s: number) {
    this.size = s;
    this.board = Square[s][s];
  }

  addTile(pos: Position, tile: Tile): void {
    this.board[pos.x][pos.y].add(tile);
  }
}
