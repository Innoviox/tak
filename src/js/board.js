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
    placed: false,
    lifted: [],
    lifted_sq: undefined,

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
                    var nt = new Tile(tile.color, tile.stone, tile.id);
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

    create: function(push = true) {
        this.make_board_frame();
        this.create_texts();
        this._draw_tiles(push);
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
        for (x = -1, i = -boardSize / 2 + .6; x++, i < boardSize / 2 + .6; i += 1.1) {
            for (y = 5, j = -boardSize / 2 + .6; y--, j < boardSize / 2 + .6; j += 1.1) {
                geom = new THREE.BoxGeometry(1, 1, .5);
                obj = new THREE.Mesh(geom, white_sqr.clone());
                obj.position.set(i - .3, j - .3, 0);
                obj.updateMatrix();
                obj.name = "square"
                obj.pos = new Position(x, y);
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
        var drawn = 0;
        for (row = 0; row < boardSize; row++) {
            for (col = 0; col < boardSize; col++) {
                var x = -(boardSize / 2) + 1.1 * row + .3,
                    y = -(boardSize / 2) + 1.1 * (boardSize - 1 - col) + .3;
                sq = this.board[row][col];
                for (idx in sq.tiles) {
                    drawn++;
                    var tile = sq.tiles[idx];
                    var tile_mesh = tile.mesh;
                    if (tile_mesh === undefined) {
                        tile.setMesh();
                        tile_mesh = tile.mesh;
                    }
                    tile_mesh.name = "tile mesh";

                    if (tile.stone == FLAT) {
                        tile_mesh.position.set(x, y, .2 * idx + .3);
                    } else if (tile.stone == STAND) {
                        tile_mesh.position.set(x, y, .2 * idx + .7);
                        tile_mesh.rotation.z = 12;
                    } else {
                        tile_mesh.position.set(x, y, .2 * idx + .2);
                        tile_mesh.rotation.x = 39.25;
                    }

                    if (this.lifted.includes(tile_mesh)) {
                        tile_mesh.position.z += .2;
                    } else if (push || !scene.children.includes(tile_mesh)) {
                        this.tiles.push(tile_mesh);
                        scene.add(tile_mesh);
                        if (!scene_ids.includes(tile.id)) {
                            scene_ids.push(tile.id);
                        }
                    } else if (this.lifted_sq != undefined && sq.equals(this.lifted_sq) && idx > sq.clicked) {
                        console.log("pushing C");
                        this.lifted.push(tile_mesh);
                        tile_mesh.position.z += .2;
                    }
                }
            }
        }
        // console.log(drawn);
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
        if (this.animating.length > 0 || this.placed) {
            for (tile of this.animating) {
                tile.animator = undefined;
                scene.remove(tile.mesh);
            }

            for (let i = scene.children.length - 1; i >= 0; i--) {
                let child = scene.children[i];
                if (child.name == "tile mesh") {
                    scene.remove(child);
                }
            }

            this.tiles = [];
            this.moving = [];
            this.animating = [];
            this.old_board = this.board;
            this.board = this.next_board;
            this.next_board = [];
            this.lifted = [];
            this.placed = false;
            this.lifted_sq = this.tile_at(this.lifted_sq.pos);
            this.lifted_sq.clicked++;
        }
    },

    click: function(obj) {
        var sq = this.tile_at(obj.pos);
        if (this.lifted_sq == undefined && sq.tiles.length == 0) {
            return;
            var move = rtc(obj.pos.x) + (obj.pos.y + 1).toString();
            this.move(Move.create(move));
        } else {
            var dir;
            if (this.lifted_sq === undefined) {
                this.lifted_sq = sq;
                sq.upped = sq.tiles.length - 1;
                for (tile of sq.tiles) {
                    console.log("pushing A");
                    this.lifted.push(tile.mesh);
                }
            } else {
                for (d of DIRS.split("")) {
                    if (sq.pos.equals(this.lifted_sq.next(d).pos)) {
                        dir = d;
                        break;
                    }
                }
                if (this.lifted_sq.equals(sq)) {
                    this.lifted = this.lifted_sq.tiles.slice((this.lifted_sq.click())).map((i) => i.mesh);
                } else if (dir === undefined) {
                    // TODO: Misclick
                    this.lifted = [];
                    var a = -sq.tiles.length + sq.up();
                    var uptiles = sq.tiles.slice(a);
                    for (tile_up of uptiles) {
                        if (tile_up !== undefined && tile_up.mesh !== undefined) {
                            console.log("pushing B");
                            this.lifted.push(tile_up.mesh);
                        }
                    }
                    this.lifted_sq = sq;
                } else {

                    if (this.held_move.started_at == undefined) {
                        this.held_move.started_at = this.lifted_sq;
                        this.held_move.moves.push(this.lifted.length);
                        this.held_move.dir = dir;

                        this.move(this.create_held());
                        this.lifted.splice(0, 1);
                        this.lifted_sq = this.lifted_sq.next(dir);
                    } else {
                        if (this.held_move.dir == dir) {
                            if (this.held_move.moves.length == 1) {
                                this.held_move.moves.push(this.lifted.length - this.tile_at(this.lifted_sq.pos).tiles.length);
                            }
                            this.held_move.moves.push(this.lifted_sq.upped + 1);
                            this.move(this.create_last_held());

                            this.lifted.splice(0, 1);

                            this.lifted_sq = this.lifted_sq.next(dir);
                        }
                    }
                }
            }
        }
    },

    create_last_held() {
        var mstr = "";
        mstr += this.lifted.length.toString();
        var pos = this.held_move.started_at.pos.clone();
        for (i = 2; i < this.held_move.moves.length; i++) {
            pos = pos.next(this.held_move.dir);
        }
        mstr += rtc(pos.x) + (pos.y + 1).toString();
        mstr += this.held_move.dir;

        return Move.create(mstr);
    },

    create_held() {
        var s = "";
        for (i = 1; i < this.held_move.moves.length; i++)
            s += this.held_move.moves[i].toString();
        var mstr = this.held_move.moves[0].toString() + rtc(this.held_move.started_at.pos.x) + (this.held_move.started_at.pos.y + 1).toString() + this.held_move.dir + s;

        return Move.create(mstr);
    }
}
