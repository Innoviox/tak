class Tile {
    constructor(color, stone, hypo=false) {
        this.color = color;
        this.stone = stone;
        this.pos = new Position(0, 0);
        this.hypo = hypo;
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
        if (this.color === WHITE)
            return this.hypo? models.w_s_transp: models.white_sqr; // colors.white_piece;
        return this.hypo? models.b_s_transp: models.black_sqr; // colors.black_piece;
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

    setPosition(x, y, idx, z_force) {
        if (this.stone == FLAT) {
            this.mesh.position.set(x, y, .2 * idx + .3 + z_force);
        } else if (this.stone == STAND) {
            this.mesh.position.set(x, y, .2 * idx + .7 + z_force);
            this.mesh.rotation.z = 12;
        } else {
            this.mesh.position.set(x, y, .2 * idx + .2 + z_force);
            this.mesh.rotation.x = 39.25;
        }
    }

    animate(new_pos, old_idx, new_idx, first) {
        var dir = new_pos.dir_from(this.pos);
        this.animator = new Animator(dir, this.pos, old_idx, first); /* TODO: idx animation */
    }
}
