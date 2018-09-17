var players = [];

class Player {
    constructor(color, name) {
        this.color = color;
        this.name = name;
        this.is_active_player = false;
        players.push(this);
    }

    activate() {
        players.map( (i) => { i.is_active_player = false; } );
        this.is_active_player = true;
    }

    deactivate() {
        Player.with_color(flip_color(this.color)).activate();
    }

    get_color() {
        if (Board.turn == 1) {
            return flip_color(this.color);
        }
        return this.color;
    }

    static active_player() {
        return players.filter(i => i.is_active_player)[0];
    }

    static with_color(color) {
        return players.filter(i => i.color == color)[0];
    }
}
