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

        var moves = str[1].split("").map((i) => parseInt(i));
        // if (moves.length == 0) {
        moves.unshift(parseInt(str[0].charAt(0)));
        // }
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

    str() {
        var m_str = "";
        if (this.stone != undefined) {
            m_str += this.stone;
            m_str += rtc(this.pos.x);
            m_str += (this.pos.y + 1).toString();
        } else {
            m_str += this.moves[0].toString();
            m_str += rtc(this.pos.x);
            m_str += (this.pos.y + 1).toString();
            m_str += this.dir;
            for (i in this.moves) {
                if (i > 0) {
                    m_str += this.moves[i].toString();
                }
            }
        }
        return m_str;
    }
}
