

var  = {


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
