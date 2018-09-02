var LEFT = "<",
    RIGHT = ">",
    UP = "+",
    DOWN = "-",
    NONE = "0",
    DIRS = "<>+-";

function ctr(c) {
    return 'abcde'.indexOf(c);
}

class Position {
    constructor(x, y) {
        this.x = ctr(x);
        this.y = parseInt(y) - 1;
    }

    next(dir) {
        if (dir == LEFT) {
            return new Position(this.x - 1, this.y);
        } else if (dir == RIGHT) {
            return new Position(this.x + 1, this.y);
        } else if (dir == UP) {
            return new Position(this.x, this.y - 1);
        } else {
            return new Position(this.x, this.y + 1);
        }
    }
}

class Move {
    constructor(total, stone, pos, moves, dir) {
        this.total = total;
        this.stone = stone;
        this.pos = pos;
        this.moves = moves;
        this.dir = dir;
    }

    static create(str) {
        dir = NONE;
        for (i = 0, c = ''; c = DIRS.charAt(i); i++) {
            if (str.includes(c)) {
                dir = c;
                str = str.split(c);
                break;
            }
        }

        if (dir == NONE) {
            var s = str.padStart(3, "F");
            console.log(s);
            return new Move(1, s.charAt(0), new Position(s.charAt(1), s.charAt(2)), [], NONE);
        }

        var moves = str[1].map((i) => parseInt(i));
        var m_str = str[0];
        if (m_str.charAt(0).match(/[0-9]/i)) {
            total = parseInt(m_str.charAt(0));
            m_str = m_str.slice(1);
        } else {
            total = 1;
        }
        var pos = new Position(m_str.charAt(0), m_str.charAt(1));
        return new Move(toatl, NONE, pos, moves, dir);
    }
}

class Tile {
    constructor(color, stone) {
        this.color = color;
        this.stone = stone;
        this.pos = new Position(0, 0);
    }
}

class Square {

    constructor(pos) {
        this.pos = pos;
        this.tiles = new Array();
    }

    add(tile) {
        if (this.tiles.length == 0 || (this.tiles.length > 0 && this.tiles[this.tiles.length - 1].stone == FLAT)) {
            this.tiles.push(tile);
            tile.pos = this.pos;
        } else {
            //TODO: tile is not flat
        }
    }
}

var Board = {
    size: 0,
    caps: 0,
    tiles: 0,
    whitepiecesleft: 0,
    blackpiecesleft: 0,
    mycolor: "white",

    // backend objects representing squares
    board: [],

    last_move: {
        start: null,
        end: null,
        dir: '',
        squares: []
    },

    create: function(sz, color) {
        this.size = sz;

        if (sz === 3) {
            this.caps = 0;
            this.tiles = 10;
        } else if (sz === 4) {
            this.caps = 0;
            this.tiles = 15;
        } else if (sz === 5) {
            this.caps = 1;
            this.tiles = 21;
        } else if (sz === 6) {
            this.caps = 1;
            this.tiles = 30;
        } else if (sz === 7) {
            this.caps = 2;
            this.tiles = 40;
        } else {
            this.caps = 2;
            this.tiles = 50;
        }
        this.whitepiecesleft = this.tiles + this.caps;
        this.blackpiecesleft = this.tiles + this.caps;

        this.mycolor = color;

        this._init_backend();
    },

    _init_backend: function() {
        this.board = new Array();
        for (i = 0; i < this.size; i++) {
            arr = new Array();
            for (j = 0; j < this.size; j++) {
                arr.push(new Square({
                    'x': i,
                    'y': j
                }, new Array()));
            }
            this.board.push(arr)
        }
    },

    add_tile: function(x, y, tile) {
        this.board[x][y].add(tile);
    },

    /*
    Execute a full move
    */
    move: function(move) {
        var old_pos = move.pos;
        var new_pos = move.pos.next(move.dir);
        if (move.moves.length > 0) {
            var first = true;
            for (idx in move.moves) {
                this._move(old_pos, new_pos, move.moves[idx], first);
                first = false;
            }
        } else {
            var sq = this.board[old_pos.x][old_pos.y];
            if (sq.tiles.length == 0) {
                this.add_tile(old_pos.x, old_pos.y, new Tile(this.mycolor, move.stone));
            } else {
                //TODO: Throw error?
            }
        }
    },

    /*
    One step of a move
    */
    _move: function(old_pos, new_pos, n, first) {
        var old_sq = this.board[old_pos.x][old_pos.y];
        var new_sq = this.board[new_pos.x][new_pos.y];

        var tiles = old_sq.tiles.slice(-n);
        var n_stone = new_pos.tiles.slice(-1)[0].stone;
        if (new_pos.tiles.length == 0 || (n_stone == FLAT)) {
            old_sq.tiles = old_sq.tiles(0, old_sq.tiles.length - n);
            for (idx in tiles) {
                new_sq.add(tiles[idx]);
            }
        } else if (n == 1 && tiles.slice(-1)[0].stone == CAP && n_stone == STAND) {
            old_sq.tiles = old_sq.tiles(0, old_sq.tiles.length - n);
            new_sq.tiles.slice(-1)[0].stone = FLAT;
            for (idx in tiles) {
                new_sq.add(tiles[idx]);
            }
        } else {
            //TODO Throw error?
        }
    }
}
