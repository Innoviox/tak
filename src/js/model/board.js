export class Square {
    constructor(pos, tiles) {
        this.pos = pos;
        this.tiles = tiles && new Array();
    }
    add(tile) {
        if (this.tiles && this.tiles[-1].stone == "F" /* Flat */) {
            this.tiles.push(tile);
        }
        else {
            //TODO: tile is not flat
        }
    }
}

export class Board {
    constructor(s) {
        this.s = s;
        this.size = s;
        this.board = Square[s][s];
    }
    addTile(pos, tile) {
        this.board[pos.x][pos.y].tiles.push(tile);
    }
}