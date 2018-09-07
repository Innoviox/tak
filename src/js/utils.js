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

    equals(pos) {
        return this.x == pos.x && this.y == pos.y;
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
        var dir = undefined;
        for (i = 0, c = ''; c = DIRS.charAt(i); i++) {
            if (str.includes(c)) {
                dir = c;
                str = str.split(c);
                break;
            }
        }

        if (dir == undefined) {
            var s = str.padStart(3, "F");
            return new Move(1, s.charAt(0), new Position(s.charAt(1), s.charAt(2)), [], undefined);
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
        return new Move(total, undefined, pos, moves, dir);
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
        this.upped = 0;
    }

    add(tile) {
        if (this.tiles.length == 0 || (this.tiles.length > 0 && this.tiles[this.tiles.length - 1].stone == FLAT)) {
            this.tiles.push(tile);
            tile.pos = this.pos;
        } else {
            //TODO: tile is not flat
        }
    }

    next(dir) {
        return Board.tile_at(this.pos.next(dir));
    }

    up() {
        if (this.upped < this.tiles.length) {
            return ++this.upped;
        }
        return --this.upped;
    }

    equals(sq) {
        return this.pos.equals(sq.pos);
    }
}
