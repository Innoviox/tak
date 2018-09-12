var GLOBAL_ID = 1;
var global_tiles = []; //{};

class Tile {
    constructor(color, stone, id = 0) {
        this.color = color;
        this.stone = stone;
        this.pos = new Position(0, 0);
        this.setMesh();
        this.animator = undefined;
        if (id != 0) {
            this.id = id;
        } else {
            this.id = ++GLOBAL_ID;
            global_tiles.push(this);
        }
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
