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
    font: "",

    create: function() {
        this.make_board_frame();

    },

    make_board_frame: function() {
        /*
    var innerGeom = new THREE.BoxBufferGeometry( Board.size + .6, Board.size + .6, .5 );
    this.inner = new THREE.Mesh( innerGeom, colors.inner );
    */

        var loader = new THREE.FontLoader();
        /*
        loader.load('fonts/helvetiker_regular.typeface.json', (response) => {
            this.font = response;
        });
        */
        loader.load('fonts/helvetiker_regular.typeface.json', function(font) {
            ViewBoard.font = font;
        },

        // onProgress callback
        function(xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },

        // onError callback
        function(err) {
            console.log('An error happened');
        });
        //top
        var tg = new THREE.Mesh(new THREE.BoxGeometry(Board.size + 2.6, 1, .5), colors.outer);
        tg.position.set(0, (Board.size + 1) / 2 + .3, 0);
        tg.updateMatrix();
        //toptext
        var textMaterial = new THREE.MeshPhongMaterial({color: 0xff0000});
        var tt = new THREE.Mesh(new THREE.TextGeometry("A B C D E", {
            font: ViewBoard.font,
            bevelEnabled: true
        }), textMaterial);
        tt.position.set((0, (Board.size + 1) / 2 + .3, 0));
        tt.updateMatrix();

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
        borderGeom.merge(tt.geometry, tt.matrix);

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
    }
}
