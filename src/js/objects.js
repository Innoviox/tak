var LEFT = "<",
    RIGHT = ">",
    UP = "+",
    DOWN = "-",
    NONE = "0",
    DIRS = "<>+-";

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
}

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
        this.setMesh();
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
        console.log(models.capModel);

        if (this.stone == FLAT) 
            return new THREE.BoxGeometry(1, 1, .2);
        else if (this.stone == STAND) 
            return new THREE.BoxGeometry(1, .2, 1);
        if (modelsLoaded) 
            return models.capModel.clone();
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
    size: 0,
    totcaps: 0,
    tottiles: 0,
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
        var squareGeom = new THREE.Geometry();
        var loader = new THREE.TextureLoader();
        var white_sqr = new THREE.MeshBasicMaterial({
            map: loader.load("images/tiles/white_simple.png", () => {})
        });
        for (i = -boardSize / 2 + .6; i < boardSize / 2 + .6; i += 1.1) {
            for (j = -boardSize / 2 + .6; j < boardSize / 2 + .6; j += 1.1) {
                geom = new THREE.BoxGeometry(1, 1, .5);
                obj = new THREE.Mesh(geom, white_sqr);
                obj.position.set(i - .3, j - .3, 0);
                obj.updateMatrix();

                squareGeom.merge(obj.geometry, obj.matrix);
            }
        }
        var squareMesh = new THREE.Mesh(squareGeom, white_sqr);
        this.objects.push(squareMesh);

        var innerGeom = new THREE.Geometry();
        for (i = 0; i < 6; i++) {
            geom = new THREE.BoxGeometry(boardSize + .6, .1, .5);
            obj = new THREE.Mesh(geom, colors.inner);
            obj.position.set(0, boardSize / 2 - 5.25 + 1.1 * i, 0);
            obj.updateMatrix();

            innerGeom.merge(obj.geometry, obj.matrix);

            geom = new THREE.BoxGeometry(.1, boardSize + .6, .5);
            obj = new THREE.Mesh(geom, colors.inner);
            obj.position.set(boardSize / 2 - 5.25 + 1.1 * i, 0, 0);
            obj.updateMatrix();

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
        console.log("updating", push);
        if (push) 
            this.tiles = [];
        
        /*
        var textureLoader = new THREE.TextureLoader();
        var whitePieceTexture = textureLoader.load("images/tiles/white_simple_pieces.png");
        whitePieceTexture.wrapS = THREE.RepeatWrapping;
        whitePieceTexture.wrapT = THREE.RepeatWrapping;
        */

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
    }
}
