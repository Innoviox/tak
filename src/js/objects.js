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

  create: function() {
    this.make_board_frame();

  },

  make_board_frame: function () {
    var innerGeom = new THREE.BoxBufferGeometry( Board.size, Board.size, .5 );
    this.inner = new THREE.Mesh( innerGeom, colors.inner );

    //top
    var tg = new THREE.Mesh(new THREE.BoxBufferGeometry(Board.size + 2, 1, .5), colors.outer);
    tg.position.set(0, (Board.size + 1) / 2, 0);

    //bottom
    var bg = new THREE.Mesh(new THREE.BoxBufferGeometry(Board.size + 2, 1, .5), colors.outer);
    bg.position.set(0, -(Board.size + 1) / 2, 0);

    //right
    var rg = new THREE.Mesh(new THREE.BoxBufferGeometry(1, Board.size, .5), colors.outer);
    rg.position.set((Board.size + 1) / 2, 0, 0);

    //left
    var lg = new THREE.Mesh(new THREE.BoxBufferGeometry(1, Board.size, .5), colors.outer);
    lg.position.set(-(Board.size + 1) / 2, 0, 0);

    this.objects.push(this.inner);
    this.objects.push(tg);
    this.objects.push(bg);
    this.objects.push(rg);
    this.objects.push(lg);
  },

}
