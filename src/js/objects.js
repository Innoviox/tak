var LEFT = "<",
    RIGHT = ">",
    UP = "+",
    DOWN = "-",
    NONE = "0",
    DIRS = "<>+-";

var ANIM_STEPS = 10;

var colors = {
    white_piece: new THREE.MeshBasicMaterial({color: 0xd4b375}),
    black_piece: new THREE.MeshBasicMaterial({color: 0x573312}),
    white_cap: new THREE.MeshBasicMaterial({color: 0xd4b375}),
    black_cap: new THREE.MeshBasicMaterial({color: 0x573312}),
    white_sqr: new THREE.MeshBasicMaterial({color: 0xe6d4a7}),
    black_sqr: new THREE.MeshBasicMaterial({color: 0xba6639}),
    inner: new THREE.MeshBasicMaterial({color: 0xc48d44}),
    outer: new THREE.MeshBasicMaterial({color: 0x6f4734}),
    letter: new THREE.MeshBasicMaterial({color: 0xFFF5B5}),
    highlighter: new THREE.LineBasicMaterial({color: 0x0000f0})
};

function ctr(c) {
    var a = 'ABCDE'.indexOf(c);
    if (a == -1) {
        return 'abcde'.indexOf(c);
    }
    return a;
}

class Position {
    constructor(x, y) {
        this.x = ctr(x);
        if (this.x == -1) {
            this.x = x;
        }
        if (typeof(y) === 'number') {
            this.y = y;
        } else {
            this.y = parseInt(y) - 1;
        }
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

    dir_from(next) {
        if (next.y == this.y) {
            if (next.x - 1 == this.x) {
                return RIGHT;
            } else {
                return LEFT;
            }
        } else {
            if (next.y - 1 == this.y) {
                return DOWN;
            } else {
                return UP;
            }
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
        var dir = NONE;
        for (i = 0, c = ''; c = DIRS.charAt(i); i++) {
            if (str.includes(c)) {
                dir = c;
                str = str.split(c);
                break;
            }
        }

        if (dir == NONE) {
            var s = str.padStart(3, "F");
            return new Move(1, s.charAt(0), new Position(s.charAt(1), s.charAt(2)), [], NONE);
        }

        var moves = str[1].split().map((i) => parseInt(i));
        var m_str = str[0];
        var total;
        if (m_str.charAt(0).match(/[0-9]/i)) {
            total = parseInt(m_str.charAt(0));
            m_str = m_str.slice(1);
        } else {
            total = 1;
        }
        var pos = new Position(m_str.charAt(0), m_str.charAt(1));
        return new Move(total, NONE, pos, moves, dir);
    }
}

class Animator {
    constructor(dir, orig, idx) {
        this.dt = {
            x: 0,
            y: 0,
            z: 0
        };
        if (dir == LEFT)
            this.dt.x = 1;
        if (dir == RIGHT)
            this.dt.x = -1;
        if (dir == DOWN)
            this.dt.y = 1;
        if (dir == UP)
            this.dt.y = -1;
        var pos = new Position(orig.x, orig.y);
        var next_sq = Board.tile_at(pos.next(dir));
        var d_idx = next_sq.tiles.length - idx;
        this.dt.z = d_idx * .2;

        this.ct = {
            x: 0,
            y: 0,
            z: 0
        };
        this.steps = 0;
    }

    step() {
        this.ct.x += this.dt.x / ANIM_STEPS;
        this.ct.y += this.dt.y / ANIM_STEPS;
        this.ct.z += this.dt.z / ANIM_STEPS;
        this.steps++;
    }

    done() {
        return this.steps >= 1.1 * ANIM_STEPS;
    }
}

class Tile {
    constructor(color, stone) {
        this.color = color;
        this.stone = stone;
        this.pos = new Position(0, 0);
        this.setMesh();
        this.animator = NONE;
    }

    setStone(stone) {
        this.stone = stone;
        this.setMesh();
    }

    setColor(color) {
        this.color = color;
        this.setMesh();
    }

    getGeom() {
        if (this.stone == FLAT) {
            return new THREE.BoxGeometry(1, 1, .2);
        } else if (this.stone == STAND) {
            return new THREE.BoxGeometry(1, .2, 1);
        }
        if (modelsLoaded) {
            return models.capModel.clone();
        }
    }

    getMat() {
        if (this.color == WHITE)
            return colors.white_piece;
        return colors.black_piece;
    }

    setMesh() {
        this.geom = this.getGeom();
        this.mat = this.getMat();

        if (this.stone == CAP) {
            this.mesh = this.geom;
        } else {
            this.mesh = new THREE.Mesh(this.geom, this.mat);
        }
    }

    animate(new_pos) {
        var dir = new_pos.dir_from(this.pos);
        this.animator = new Animator(dir, this.pos, 0);/* TODO: idx animation */
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

    // backend objects representing squares
    board: [],
    old_board: [],
    next_board: [],

    last_move: {},

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

    /*
    Execute a full move
    */
    move: function(move) {
        this.last_move = move;
        this.old_board = this.copy();
        this.next_board = this.copy();
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
                this.add_next_tile(old_pos.x, old_pos.y, new Tile(this.mycolor, move.stone));
            } else {
                //TODO: Throw error?
            }
        }
    },

    /*
    One step of a move
    */
    _move: function(old_pos, new_pos, n, first) {
        var old_sq = this.next_board[old_pos.x][old_pos.y];
        var new_sq = this.next_board[new_pos.x][new_pos.y];

        var tiles = old_sq.tiles.slice(-n);
        var btiles = this.board[old_pos.x][old_pos.y].tiles.slice(-n);
        var n_stone;
        if (new_sq.tiles.length) {
            n_stone = new_sq.tiles.slice(-1)[0].stone;
        } else {
            n_stone = NONE;
        }
        if (new_sq.tiles.length == 0 || (n_stone == FLAT)) {
            old_sq.tiles = old_sq.tiles.slice(0, old_sq.tiles.length - n);
            for (idx in tiles) {
                new_sq.add(tiles[idx]);
                btiles[idx].animate(new_pos);
                this.moving.push(btiles[idx]);
                this.animating.push(btiles[idx]);
            }
        } else if (n == 1 && tiles.slice(-1)[0].stone == CAP && n_stone == STAND) {
            old_sq.tiles = old_sq.tiles.slice(0, old_sq.tiles.length - n);
            new_sq.tiles.slice(-1)[0].setStone(FLAT);
            for (idx in tiles) {
                new_sq.add(tiles[idx]);
                btiles[idx].animate(new_pos);
                this.moving.push(btiles[idx]);
                this.animating.push(btiles[idx]);
            }
        } else {
            //TODO Throw error?
        }
    },

    create: function() {
        this.make_board_frame();
        this.create_texts();
        this._draw_tiles(true);
    },

    draw: function() {
        this.update_tiles();
    },

    make_board_frame: function() {
        //top
        var tg = new THREE.Mesh(new THREE.BoxGeometry(boardSize + 2.6, 1, .5), colors.outer);
        tg.position.set(0, (boardSize + 1) / 2 + .3, 0);
        tg.updateMatrix();

        //bottom
        var bg = new THREE.Mesh(new THREE.BoxGeometry(boardSize + 2.6, 1, .5), colors.outer);
        bg.position.set(0, -(boardSize + 1) / 2 - .3, 0);
        bg.updateMatrix();

        //right
        var rg = new THREE.Mesh(new THREE.BoxGeometry(1, boardSize + .6, .5), colors.outer);
        rg.position.set((boardSize + 1) / 2 + .3, 0, 0);
        rg.updateMatrix();

        //left
        var lg = new THREE.Mesh(new THREE.BoxGeometry(1, boardSize + .6, .5), colors.outer);
        lg.position.set(-(boardSize + 1) / 2 - .3, 0, 0);
        lg.updateMatrix();

        var borderGeom = new THREE.Geometry();
        borderGeom.merge(tg.geometry, tg.matrix);
        borderGeom.merge(bg.geometry, bg.matrix);
        borderGeom.merge(lg.geometry, lg.matrix);
        borderGeom.merge(rg.geometry, rg.matrix);

        var borderMesh = new THREE.Mesh(borderGeom, colors.outer);

        this.objects.push(borderMesh);

        var geom,
            obj;
        // var squareGeom = new THREE.Geometry();
        var loader = new THREE.TextureLoader();
        var white_sqr = new THREE.MeshBasicMaterial({
            map: loader.load("images/tiles/white_simple.png", () => {})
        });
        for (i = -boardSize / 2 + .6; i < boardSize / 2 + .6; i += 1.1) {
            for (j = -boardSize / 2 + .6; j < boardSize / 2 + .6; j += 1.1) {
                geom = new THREE.BoxGeometry(1, 1, .5);
                obj = new THREE.Mesh(geom, white_sqr.clone());
                obj.position.set(i - .3, j - .3, 0);
                obj.updateMatrix();
                obj.name = "square"
                this.inner.push(obj);
                this.objects.push(obj);

                // squareGeom.merge(obj.geometry, obj.matrix);
            }
        }
        // var squareMesh = new THREE.Mesh(squareGeom, white_sqr);
        // this.objects.push(squareMesh);

        var innerGeom = new THREE.Geometry();
        for (i = 0; i < 6; i++) {
            geom = new THREE.BoxGeometry(boardSize + .6, .1, .5);
            obj = new THREE.Mesh(geom, colors.inner);
            obj.position.set(0, boardSize / 2 - 5.25 + 1.1 * i, 0);
            obj.updateMatrix();
            obj.name = "inner";
            innerGeom.merge(obj.geometry, obj.matrix);

            geom = new THREE.BoxGeometry(.1, boardSize + .6, .5);
            obj = new THREE.Mesh(geom, colors.inner);
            obj.position.set(boardSize / 2 - 5.25 + 1.1 * i, 0, 0);
            obj.updateMatrix();
            obj.name = "inner";

            innerGeom.merge(obj.geometry, obj.matrix);
        }
        var innerMesh = new THREE.Mesh(innerGeom, colors.inner);
        this.objects.push(innerMesh);
    },

    create_texts() {
        var loader = new THREE.FontLoader();
        loader.load('fonts/helvetiker_regular.typeface.json', this._create_texts);
    },

    _create_texts(font) {
        var rot90 = 23.57,
            rot = 0;

        for (x = 0, c = ''; c = "ABCDE".charAt(x); x++) {
            var tt = new THREE.Mesh(new THREE.TextGeometry(c, {
                font: font,
                size: .6,
                height: .2
            }), colors.letter);
            tt.rotation.z = rot * rot90;
            tt.position.set(-(boardSize) / 2 + 1.1 * x, (boardSize + 1) / 2, 0.1);
            tt.updateMatrix();

            scene.add(tt);
        }
        rot++;

        for (x = 0, c = ''; c = "12345".charAt(x); x++) {
            var tt = new THREE.Mesh(new THREE.TextGeometry(c, {
                font: font,
                size: .6,
                height: .2
            }), colors.letter);
            tt.rotation.z = rot * rot90;
            tt.position.set((boardSize) / 2 + .5, (boardSize + 1) / 2 + .6 - 1.1 * (x + 1), 0.1);
            tt.updateMatrix();
            scene.add(tt);
        }
        rot++;

        for (x = 0, c = ''; c = "ABCDE".charAt(x); x++) {
            var tt = new THREE.Mesh(new THREE.TextGeometry(c, {
                font: font,
                size: .6,
                height: .2
            }), colors.letter);
            tt.rotation.z = rot * rot90;
            tt.position.set(-(boardSize) / 2 + 1.1 * x + .5, -(boardSize + 1) / 2, 0.1);
            tt.updateMatrix();

            scene.add(tt);
        }
        rot++;

        for (x = 0, c = ''; c = "12345".charAt(x); x++) {
            var tt = new THREE.Mesh(new THREE.TextGeometry(c, {
                font: font,
                size: .6,
                height: .2
            }), colors.letter);
            tt.rotation.z = rot * rot90;
            tt.position.set(-(boardSize) / 2 - .5, (boardSize + 1) / 2 - 1.1 * (x + 1), 0.1);
            tt.updateMatrix();
            scene.add(tt);
        }
        rot++;
    },

    _draw_tiles: function(push) {
        if (push)
            this.tiles = [];

        for (row = 0; row < boardSize; row++) {
            for (col = 0; col < boardSize; col++) {
                var x = -(boardSize / 2) + 1.1 * row + .3,
                    y = -(boardSize / 2) + 1.1 * (boardSize - 1 - col) + .3;
                sq = this.board[row][col];
                for (idx in sq.tiles) {
                    var tile = sq.tiles[idx];
                    var tile_mesh = tile.mesh;
                    if (tile_mesh === undefined) {
                        tile.setMesh();
                        tile_mesh = tile.mesh;
                    }
                    if (tile.stone == FLAT) {
                        tile_mesh.position.set(x, y, .2 * idx + .3);
                    } else if (tile.stone == STAND) {
                        tile_mesh.position.set(x, y, .2 * idx + .7);
                        tile_mesh.rotation.z = 12;
                    } else {
                        tile_mesh.position.set(x, y, .2 * idx + .2);
                        tile_mesh.rotation.x = 39.25;
                    }
                    if (push || !scene.children.includes(tile_mesh)) {
                        this.tiles.push(tile_mesh);
                        scene.add(tile_mesh);
                    }
                }
            }
        }
    },

    update_tiles: function() {
        this._draw_tiles(false);
        this.animate_tiles();
        if (this.moving.length == 0) {
            this.execute_move();
            this._draw_tiles(false);
        }
    },

    animate_tiles: function() {
        remove = [];
        for (tile of this.animating) {
            var helper = tile.animator;
            if (!helper.done())
                helper.step();
            tile.mesh.position.x += helper.ct.x;
            tile.mesh.position.y += helper.ct.y;
            tile.mesh.position.z += helper.ct.z;
            if (helper.done()) {
                remove.push(tile);
            }
        }
        this.moving = this.moving.filter((el) => !remove.includes(el));
    },

    execute_move: function() {
        if (this.animating.length > 0) {
            for (tile of this.animating) {
                tile.animator = NONE;
                scene.remove(tile.mesh);
            }

            for (tile of this.tiles) {
                scene.remove(tile.mesh);
            }

            this.tiles = [];
            this.moving = [];
            this.animating = [];
            this.old_board = this.board;
            this.board = this.next_board;
            this.next_board = [];
        }
    }
}
