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
    var innerGeom = new THREE.BoxBufferGeometry( Board.size, Board.size, .5, Board.size, Board.size );
    this.inner = new THREE.Mesh( innerGeom, colors.inner );
  	this.inner.receiveShadow = true;
  	this.inner.castShadow = true;

    var outerGeom = new THREE.BoxBufferGeometry( Board.size + 1, Board.size + 1, .5, Board.size + 1, Board.size + 1 );
    this.outer = new THREE.Mesh( outerGeom, colors.outer );
    this.outer.receiveShadow = true;
    this.outer.castShadow = true;

    this.objects.push(this.inner);
    this.objects.push(this.outer);
  },

  create_highlights: function() {

  },

  create_borders: function() {

  }

}
