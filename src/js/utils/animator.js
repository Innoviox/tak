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
