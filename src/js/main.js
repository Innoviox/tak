var boardSize = 5;

// Constants
var BLACK = "black";
var WHITE = "white";
var FLAT = "F";
var STAND = "S";
var CAP = "C";

// Graphics variables
var container,
    stats;
var camera,
    controls,
    scene,
    renderer;
var lights = new Array();
var vizboard;
var clock = new THREE.Clock();
var time = 0;

initGraphics();
animate();

function loadSampleBoard() {
    /*
	for (i = 0; i < 5; i++) {
		for (j = 0; j < 5; j++) {
			Board.add_tile(i, j, new Tile(WHITE, STAND));
		}
	}
	*/

    Board.add_tile(1, 2, new Tile(BLACK, FLAT));
    Board.add_tile(1, 3, new Tile(WHITE, STAND));
    Board.add_tile(4, 2, new Tile(BLACK, CAP));

}

function initGraphics() {

    container = document.getElementById('container');

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    container.innerHTML = "";

    container.appendChild(renderer.domElement);

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild(stats.domElement);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.2, 2000);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfd1e5);

    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 10
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    controls = new THREE.OrbitControls(camera);

    Board.create(5, "white");
    loadSampleBoard();
    ViewBoard.create();
    for (idx in ViewBoard.objects) {
        var obj = ViewBoard.objects[idx];
        obj.receiveShadow = true;
        obj.castShadow = true;
        scene.add(obj);
    }

    for (i = -10; i += 20; i < 30) {
        light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(i, i, 5);
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
        lights.push(light);
        scene.add(light);
    }

    window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    requestAnimationFrame(animate);

    render();
    stats.update();

}

function render() {
    var deltaTime = clock.getDelta();
    renderer.render(scene, camera);
    time += deltaTime;
}
