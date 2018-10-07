const Position = require('../graphics/util/position.js');
const Square = require('../graphics/util/square.js');
const Tile = require('../graphics/util/tile.js');

var boardSize = 5;

const ServerBoard = {
    objects: [],
    tiles: [],
    moving: [],
    animating: [],
    inner: [],
    size: 0,
    totcaps: 0,
    tottiles: 0,
    whitepiecesleft: 0,
    blackpiecesleft: 0,
    mycolor: "white",
    placed: false,
    lifted: [],
    lifted_sq: undefined,
    hud_tiles: [],
    turn_number: 0,
    hud_selected: undefined,

    // backend objects representing squares
    board: [],
    old_board: [],
    next_board: [],

    last_move: {},
    held_move: {
        moves: [],
        started_at: undefined,
        dir: undefined
    },

    init: function(sz, color) {
        boardSize = sz;

        if (sz === 3) {
            this.totcaps = 0;
            this.tottiles = 10;
        } else if (sz === 4) {
            this.totcaps = 0;
            this.tottiles = 15;
        } else if (sz === 5) {
            this.totcaps = 1;
            this.tottiles = 21;
        } else if (sz === 6) {
            this.totcaps = 1;
            this.tottiles = 30;
        } else if (sz === 7) {
            this.totcaps = 2;
            this.tottiles = 40;
        } else {
            this.totcaps = 2;
            this.tottiles = 50;
        }
        this.whitepiecesleft = this.tottiles + this.totcaps;
        this.blackpiecesleft = this.tottiles + this.totcaps;

        this.mycolor = color;

        this._init_backend();
    },

    _init_backend: function() {
        this.board = new Array();
        for (i = 0; i < boardSize; i++) {
            arr = new Array();
            for (j = 0; j < boardSize; j++) {
                arr.push(new Square(new Position(i, j), new Array()));
            }
            this.board.push(arr);
        }
        this.next_board = this.copy();
    },

    tile_at: function(pos) {
        return this.board[pos.x][pos.y];
    },

    add_tile: function(x, y, tile) {
        this.board[x][y].add(tile);
    },

    add_next_tile: function(x, y, tile) {
        this.next_board[x][y].add(tile);
    },

    copy: function() {
        a = [];
        for (i = 0; i < boardSize; i++) {
            row = [];
            for (j = 0; j < boardSize; j++) {
                var sq = this.board[i][j];
                s = new Square(new Position(sq.pos.x, sq.pos.y));
                for (idx in sq.tiles) {
                    var tile = sq.tiles[idx];
                    var nt = new Tile(tile.color, tile.stone);
                    s.add(nt);
                }
                row.push(s);
            }
            a.push(row);
        }
        return a;
    },

    move: function(move) {
        this.last_move = move;
        this.old_board = this.copy();
        this.next_board = this.copy();
        var old_pos = move.pos;
        var new_pos = move.pos.next(move.dir);
        if (move.moves.length > 0) {
            var first = true;
            for (n of move.moves) {
                this._move(old_pos, new_pos, n, first);
                first = false;
            }
        } else {
            var sq = this.board[old_pos.x][old_pos.y];
            if (sq.tiles.length == 0) {
                this.add_next_tile(old_pos.x, old_pos.y, new Tile(this.mycolor, move.stone));
                this.placed = true;
            } else {
                //TODO: Throw error?
            }
        }
    },

    _move: function(old_pos, new_pos, n, first) {
        var old_sq = this.next_board[old_pos.x][old_pos.y];
        var new_sq = this.next_board[new_pos.x][new_pos.y];

        var tiles = old_sq.tiles.slice(-n);
        var btiles = this.board[old_pos.x][old_pos.y].tiles.slice(-n);
        var n_stone;
        if (new_sq.tiles.length) {
            n_stone = new_sq.tiles.slice(-1)[0].stone;
        } else {
            n_stone = undefined;
        }
        if (new_sq.tiles.length == 0 || (n_stone == FLAT)) {
            old_sq.tiles = old_sq.tiles.slice(0, old_sq.tiles.length - n);
            var first = true;
            for (idx in tiles) {
                new_sq.add(tiles[idx]);
                btiles[idx].animate(new_pos, idx, new_sq.tiles.length, first);
                this.moving.push(btiles[idx]);
                this.animating.push(btiles[idx]);
                first = false;
            }
        } else if (n == 1 && tiles.slice(-1)[0].stone == CAP && n_stone == STAND) {
            old_sq.tiles = old_sq.tiles.slice(0, old_sq.tiles.length - n);
            new_sq.tiles.slice(-1)[0].setStone(FLAT);
            var first = true;
            for (idx in tiles) {
                new_sq.add(tiles[idx]);
                btiles[idx].animate(new_pos, idx, new_sq.tiles.length, first);
                this.moving.push(btiles[idx]);
                this.animating.push(btiles[idx]);
                first = false;
            }
        } else {
            //TODO Throw error?
        }
    }
}

module.exports = ServerBoard;