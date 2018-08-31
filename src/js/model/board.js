class Tile {
    constructor(color, stone) {
        this.color = color;
        this.stone = stone;
        this.x = 0;
        this.y = 0;
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
            tile.x = this.x;
            tile.y = this.y;
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

    move: {
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
        this.move = {
            start: null,
            end: null,
            dir: '',
            squares: []
        };

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
    }
}
