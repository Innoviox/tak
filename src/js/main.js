require(['./js/lib/three.min.js']);

require(['./js/lib/OBJLoader.js']);
require(['./js/lib/OrbitControls.js']);
require(['./js/lib/Detector.js']);

require(['./js/model/board.js']);

boardSize = 5;

// Graphics variables
var container, stats;
var camera, controls, scene, renderer;
var boardGeometry, boardMaterial, board;
var clock = new THREE.Clock();
var time = 0;

initGraphics();
animate();

function loadBoard() {
	//TODO
}

function initGraphics() {

	container = document.getElementById( 'container' );

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMap.enabled = true;

	container.innerHTML = "";

	container.appendChild( renderer.domElement );

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild( stats.domElement );


	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.2, 2000 );

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xbfd1e5 );

	camera.position.x = 0;
	camera.position.y = 0;
	camera.position.z = 10
	camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

	controls = new THREE.OrbitControls( camera );

	var boardGeometry = new THREE.BoxBufferGeometry( boardSize + 1, boardSize + 1, .5, boardSize + 1, boardSize + 1 );
	// var boardMaterial = new THREE.MeshBasicMaterial( {color: 0xffffff} );
	var boardMaterial = new THREE.MeshBasicMaterial(
            {map: THREE.OBJLoader.load('images/board/3ed/capstone.obj', loadBoard)});


  var board = new THREE.Mesh( boardGeometry, boardMaterial );
	board.receiveShadow = true;
	board.castShadow = true;
	scene.add( board );

	/*
	var textureLoader = new THREE.TextureLoader();
	textureLoader.load("textures/grid.png", function ( texture ) {
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( terrainWidth - 1, terrainDepth - 1 );
		groundMaterial.map = texture;
		groundMaterial.needsUpdate = true;
	});
	*/

	var light = new THREE.DirectionalLight( 0xffffff, 1 );
	light.position.set( 100, 100, 50 );
	light.castShadow = true;
	var dLight = 200;
	var sLight = dLight * 0.25;
	light.shadow.camera.left = -sLight;
	light.shadow.camera.right = sLight;
	light.shadow.camera.top = sLight;
	light.shadow.camera.bottom = -sLight;

	light.shadow.camera.near = dLight / 30;
	light.shadow.camera.far = dLight;

	light.shadow.mapSize.x = 1024 * 2;
	light.shadow.mapSize.y = 1024 * 2;

	scene.add(light);


	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	requestAnimationFrame(animate);

	render();
	stats.update();

}

function render() {
	var deltaTime = clock.getDelta();
	renderer.render( scene, camera );
	time += deltaTime;
}
