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
var frame = 0;
var modelsLoaded = false;

var models = {
    capModel: NONE
}

initGraphics();
animate();

function loadSampleBoard() {
    Board.add_tile(1, 2, new Tile(BLACK, FLAT)); // B3
    Board.add_tile(1, 3, new Tile(WHITE, STAND)); // B4
    Board.add_tile(1, 2, new Tile(BLACK, CAP)); //  B3
}

function load_models() {
    var mtl = new THREE.MTLLoader().setPath('images/tiles/3d/');
    var obj = new THREE.OBJLoader().setPath('images/tiles/3d/');
    // White capstone model
    mtl.load('rook-small-door-matte.mtl', function(materials) {
        materials.preload();
        obj.setMaterials(materials).load('rook-small-door-matte.obj', function(model) {
            models.capModel = model;
            modelsLoaded = true;
        });
    });
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
    load_models();
    Board.init(5, "white");
    Board.create();

    loadSampleBoard();
    for (idx in Board.objects) {
        var obj = Board.objects[idx];
        obj.receiveShadow = true;
        obj.castShadow = true;
        scene.add(obj);
    }

    for (i = -10; i < 30; i += 20) {
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
    if (modelsLoaded) {
        var deltaTime = clock.getDelta();
        // ViewBoard.draw();
        if (frame++ % 30 == 0) {
            Board.draw();
        }
        renderer.render(scene, camera);
        time += deltaTime;
    }
}
