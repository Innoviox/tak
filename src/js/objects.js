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

var ViewBoard = {
    inner: "",
    outer: "",
    objects: [],
    fonts: [],

    create: function() {
        this.make_board_frame();
        this.create_texts();
        this.draw_tiles();
    },

    make_board_frame: function() {
        //top
        var tg = new THREE.Mesh(new THREE.BoxGeometry(Board.size + 2.6, 1, .5), colors.outer);
        tg.position.set(0, (Board.size + 1) / 2 + .3, 0);
        tg.updateMatrix();

        //bottom
        var bg = new THREE.Mesh(new THREE.BoxGeometry(Board.size + 2.6, 1, .5), colors.outer);
        bg.position.set(0, -(Board.size + 1) / 2 - .3, 0);
        bg.updateMatrix();

        //right
        var rg = new THREE.Mesh(new THREE.BoxGeometry(1, Board.size + .6, .5), colors.outer);
        rg.position.set((Board.size + 1) / 2 + .3, 0, 0);
        rg.updateMatrix();

        //left
        var lg = new THREE.Mesh(new THREE.BoxGeometry(1, Board.size + .6, .5), colors.outer);
        lg.position.set(-(Board.size + 1) / 2 - .3, 0, 0);
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
        for (i = -Board.size / 2 + .6; i < Board.size / 2 + .6; i += 1.1) {
            for (j = -Board.size / 2 + .6; j < Board.size / 2 + .6; j += 1.1) {
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
            geom = new THREE.BoxGeometry(Board.size + .6, .1, .5);
            obj = new THREE.Mesh(geom, colors.inner);
            obj.position.set(0, Board.size / 2 - 5.25 + 1.1 * i, 0);
            obj.updateMatrix();

            innerGeom.merge(obj.geometry, obj.matrix);

            geom = new THREE.BoxGeometry(.1, Board.size + .6, .5);
            obj = new THREE.Mesh(geom, colors.inner);
            obj.position.set(Board.size / 2 - 5.25 + 1.1 * i, 0, 0);
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
            tt.position.set(-(Board.size) / 2 + 1.1 * x, (Board.size + 1) / 2, 0.1);
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
            tt.position.set((Board.size) / 2 + .5, (Board.size + 1) / 2 + .6 - 1.1 * (x + 1), 0.1);
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
            tt.position.set(-(Board.size) / 2 + 1.1 * x + .5, -(Board.size + 1) / 2, 0.1);
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
            tt.position.set(-(Board.size) / 2 - .5, (Board.size + 1) / 2 - 1.1 * (x + 1), 0.1);
            tt.updateMatrix();
            scene.add(tt);
        }
        rot++;
    },

    draw_tiles: function() {
        var textureLoader = new THREE.TextureLoader();
        var whitePieceTexture = textureLoader.load("images/tiles/white_simple_pieces.png");
        whitePieceTexture.wrapS = THREE.RepeatWrapping;
        whitePieceTexture.wrapT = THREE.RepeatWrapping;
        // texture.repeat.set(terrainWidth - 1, terrainDepth - 1);
        for (row = 0; row < boardSize; row++) {
            for (col = 0; col < boardSize; col++) {
                sq = Board.board[row][col];
                for (idx in sq.tiles) {
                    tile = sq.tiles[idx];
                    console.log(tile.stone);
                    if (tile.stone == FLAT) {
                        var tile_geom = new THREE.BoxGeometry(1, 1, .2);
                        var tile_mesh = new THREE.Mesh(tile_geom, colors.white_piece);
                        tile_mesh.position.set(-(boardSize / 2) + 1.1 * row + .3, -(boardSize / 2) + 1.1 * col + .3, .4);
                        tile_mesh.name = "flat";
                        scene.add(tile_mesh);
                    } else if (tile.stone == STAND) {
                      console.log(col);
                        var tile_geom = new THREE.BoxGeometry(1, .2, 1);
                        var tile_mesh = new THREE.Mesh(tile_geom, colors.white_piece);
                        tile_mesh.position.set(-(boardSize / 2) + 1.1 * row + .3, -(boardSize / 2) + 1.1 * col + .3,  .8);
                        tile_mesh.rotation.z = 12;
                        tile_mesh.name = "stand";
                        scene.add(tile_mesh);
                    }
                }
            }
        }
    }
}
