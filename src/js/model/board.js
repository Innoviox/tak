define(["require", "exports", "typescript-collections"], function (require, exports, typescript_collections_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ;
    ;
    class Square {
        constructor(pos, tiles) {
            this.pos = pos;
            this.tiles = tiles && new typescript_collections_1.LinkedList();
        }
        add(tile) {
            if (this.tiles && this.tiles.last().stone == "F" /* Flat */) {
                this.tiles.add(tile);
            }
            else {
                //TODO: tile is not flat
            }
        }
    }
    class Board {
        constructor(s) {
            this.s = s;
            this.size = s;
            this.board = Square[s][s];
        }
        addTile(pos, tile) {
            this.board[pos.x][pos.y].add(tile);
        }
    }
});
