function make_board_frame() {
  var boardGeometry = new THREE.BoxBufferGeometry( Board.size + 1, Board.size + 1, .5, Board.size + 1, Board.size + 1 );
	var boardMaterial = new THREE.MeshBasicMaterial( {color: 0xffffff} );
  var vizBoard = new THREE.Mesh( boardGeometry, boardMaterial );
	vizBoard.receiveShadow = true;
	vizBoard.castShadow = true;
	return vizBoard
}
