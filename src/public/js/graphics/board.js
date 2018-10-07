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


var Board = {
    objects: [],
    tiles: [],
    moving: [],
    animating: [],
    inner: [],
    force_board: undefined,
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
    },

    create: function() {
        this.make_board_frame();
        this.create_texts();
        this.make_hud_tiles();
        this._draw_tiles(true);
    },

    draw: function() {
        this.update_tiles();
        if (this.held_move.started_at != undefined) {
            $("#btn-submit").text("Submit Move: " + this.create_held().str());
        }
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
        for (x = -1, i = -boardSize / 2 + .6; x++, i < boardSize / 2 + .6; i += 1.1) {
            for (y = 5, j = -boardSize / 2 + .6; y--, j < boardSize / 2 + .6; j += 1.1) {
                geom = new THREE.BoxGeometry(1, 1, .5);
                obj = new THREE.Mesh(geom, models.board_sqr.clone());
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

        for (row = 0; row < boardSize; row++) {
            for (col = 0; col < boardSize; col++) {
                var x = -(boardSize / 2) + 1.1 * row + .3,
                    y = -(boardSize / 2) + 1.1 * (boardSize - 1 - col) + .3;
                sq = this.board[row][col];
                for (idx in sq.tiles) {
                    var tile = sq.tiles[idx];
                    if (tile.mesh === undefined) {
                        tile.setMesh();
                    }
                    var tile_mesh = tile.mesh;
                    tile_mesh.name = "tile mesh";

                    var z = false;

                    if (this.lifted.includes(tile_mesh)) {
                        z = true;
                    } else if (push || !scene.children.includes(tile_mesh)) {
                        this.tiles.push(tile_mesh);
                        scene.add(tile_mesh);
                    } else if (this.lifted_sq != undefined && sq.equals(this.lifted_sq) && idx > this.lifted_sq.clicked) {
                        console.log("ADDING!", idx, sq.clicked);
                        this.lifted.push(tile_mesh);
                        z = true;
                    }

                    tile.setPosition(
                        x, y, idx, z
                        ? .2
                        : 0);
                }
            }
        }

        for (tile of this.hud_tiles) {
            if (tile.mesh.lifted) {
                if (!tile.mesh.added) {
                    tile.mesh.position.z += .2;
                    tile.mesh = true;
                }
            }
        }
    },

    make_hud_tiles: function() {
        var row = 0,
            idx = 0;
        for (i = 0; i < this.tottiles; i++) {
            this._draw_hud_tile(WHITE, FLAT, row, idx);
            this._draw_hud_tile(BLACK, FLAT, boardSize - row, idx);
            idx++;
            if (idx % 5 == 0) {
                idx = 0;
                row++;
            }
        }

        row = boardSize;

        for (i = 0; i < this.totcaps; i++) {
            this._draw_hud_tile(WHITE, CAP, row, 0);
            this._draw_hud_tile(BLACK, CAP, boardSize - row, 0);
            row--;
        }
    },

    _draw_hud_tile: function(color, stone, row, idx) {
        tile = new Tile(color, stone);
        tile.setPosition(
            color == WHITE
            ? (-(boardSize / 2) - 2.1)
            : (boardSize / 2 + 2.1),
        (-boardSize / 2) + row * 1.1,
        idx,
        0);
        this.hud_tiles.push(tile);
        tile.mesh.name = "hud tile";
        tile.mesh.lifted = false;
        tile.mesh.added = false;
        tile.mesh.tile = tile;
        scene.add(tile.mesh);
    },

    update_tiles: function() {
        this._draw_tiles(false);
        this.animate_tiles();
        if (this.moving.length == 0) {
            this.execute_move();
            this._draw_tiles(false);
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
            if (!this.lifted.includes(tile.mesh)) {
                tile.mesh.position.z += .2;
            }
            if (helper.done()) {
                remove.push(tile);
            }
        }
        this.moving = this.moving.filter((el) => !remove.includes(el));
    },

    execute_move: function() {
        a = false;
        if (this.animating.length > 0) {
            for (tile of this.animating) {
                tile.animator = undefined;
                scene.remove(tile.mesh);
            }

            for (tile of this.tiles) {
                scene.remove(tile.mesh);
            }
            if (this.lifted_sq) {
                this.lifted_sq = this.tile_at(this.lifted_sq.pos);
            }
            a = true;
        } else if (this.placed) {
            this.selected = undefined;
            a = true;
        }
        if (a) {
            this.tiles = [];
            this.moving = [];
            this.animating = [];
            this.old_board = this.board;
            this.board = this.next_board;
            this.next_board = [];
            if (this.force_board) {
                this.board = this.force_board;
                this.force_board = undefined;
            }
            this.lifted = [];
            this.placed = false;
        }
    },

    click: function(obj) {
        if (obj.name == "hud tile") {
            if (this.selected == undefined) {
                obj.lifted = !obj.lifted;
                obj.added = false;
                this.selected = obj;
                this.selected.position.z += 1;
                return;
            } else if (obj == this.selected) {
                console.log("true");
                var tile = this.selected.tile;
                tile.stone = tile.stone == FLAT
                    ? STAND
                    : FLAT;
                var position = this.selected.position
                scene.remove(this.selected);
                tile.setMesh();
                tile.mesh.position.set(position.x, position.y, position.z);
                tile.mesh.name = "hud tile";
                this.selected = tile.mesh;
                tile.mesh.tile = tile;
                scene.add(this.selected);
                return;
            }
        }

        var sq = this.tile_at(obj.pos);
        if (this.selected != undefined && this.lifted_sq == undefined && sq.tiles.length == 0) {
            //TODO: select click animation
            scene.remove(this.selected);
            var move = this.selected.tile.stone + rtc(obj.pos.x) + (obj.pos.y + 1).toString();
            this.held_move.started_at = this.tile_at(obj.pos);
            this.held_move.stone = this.selected.tile.stone;
            this.move(Move.create(move));
        } else {
            var dir;
            if (this.lifted_sq == undefined) {
                this.lifted_sq = sq;
                sq.upped = sq.tiles.length - 1;
                for (tile of sq.tiles) {
                    this.lifted.push(tile.mesh);
                }
            } else {
                try {
                    this.lifted_sq.next("-").pos;
                } catch  {
                    this.lifted_sq = undefined;
                }
                for (d of DIRS.split("")) {
                    if (sq.pos.equals(this.lifted_sq.next(d).pos)) {
                        dir = d;
                        break;
                    }
                }
                if (this.lifted_sq.equals(sq)) {
                    this.lifted_sq = sq;
                    this.lifted = this.lifted_sq.tiles.slice((this.lifted_sq.click())).map((i) => i.mesh);
                } else if (dir === undefined) {
                    // TODO: Misclick
                    this.lifted = [];
                    var a = -sq.tiles.length + sq.up();
                    var uptiles = sq.tiles.slice(a);
                    for (tile_up of uptiles) {
                        if (tile_up !== undefined && tile_up.mesh !== undefined) {
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
                        this.lifted_sq = this.lifted_sq.next(dir);
                        for (tile of this.lifted) {
                            scene.remove(tile);
                        }
                        this.lifted.splice(0, this.lifted_sq.tiles.length);
                        this.lifted_sq.clicked = this.lifted_sq.tiles.length;
                        this.tile_at(this.lifted_sq.pos).clicked = this.lifted_sq.tiles.length;
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

    create_last_held: function() {
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

    create_held: function() {
        var s = "";
        var mstr = "";
        if (this.held_move.moves.length > 0) {
            for (i = 1; i < this.held_move.moves.length; i++)
                s += Math.abs(this.held_move.moves[i]).toString();
            mstr = this.held_move.moves[0].toString()
        } else {
            mstr = this.held_move.stone
        }
        mstr += rtc(this.held_move.started_at.pos.x) + (this.held_move.started_at.pos.y + 1).toString() + this.held_move.dir + s;

        return Move.create(mstr);
    },

    click_off: function() {
        if (this.selected) {
            var tile = this.selected.tile;
            var stone = tile.stone;
            tile.stone = FLAT;
            var position = this.selected.position;
            scene.remove(this.selected);
            tile.setMesh();
            tile.mesh.position.set(position.x, position.y, position.z - 1.2);
            tile.mesh.name = "hud tile";
            this.selected = tile.mesh;
            tile.mesh.tile = tile;
            scene.add(this.selected);
            this.selected = null;
            return;
        } else if (this.lifted) {
            this.lifted_sq = this.tile_at(this.lifted_sq.pos);
            if (this.lifted_sq) {
                this.lifted_sq.clicked = this.lifted_sq.tiles.length;
            }
            console.log(this.lifted_sq);
            this.lifted = [];
        }
    }
}

module.exports = Board;