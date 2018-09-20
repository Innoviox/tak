class Tile {
    constructor(color, stone) {
        this.color = color;
        this.stone = stone;
        this.pos = new Position(0, 0);
        this.setMesh();
        this.animator = undefined;
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
            return models.white_sqr; // colors.white_piece;
        return models.black_sqr; // colors.black_piece;
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

    setPosition(x, y, idx) {
        if (this.stone == FLAT) {
            this.mesh.position.set(x, y, .2 * idx + .3);
        } else if (this.stone == STAND) {
            this.mesh.position.set(x, y, .2 * idx + .7);
            this.mesh.rotation.z = 12;
        } else {
            this.mesh.position.set(x, y, .2 * idx + .2);
            this.mesh.rotation.x = 39.25;
        }
    }

    animate(new_pos, old_idx, new_idx, first) {
        var dir = new_pos.dir_from(this.pos);
        this.animator = new Animator(dir, this.pos, old_idx, first); /* TODO: idx animation */
    }
}
