var boardSize = 5;

// Constants
var BLACK = "black";
var WHITE = "white";
var FLAT = "F";
var STAND = "S";
var CAP = "C";
var STONES = "FSC";

// Graphics variables
var container;
var camera,
    controls,
    scene,
    renderer;
var light;
var clock = new THREE.Clock();
var time = 0;
var frame = 0;
var modelsLoaded = false;
var keyboard = new THREEx.KeyboardState();
var projector,
    mouse = {
        x: 0,
        y: 0
    },
    INTERSECTED;

var models = {
    capModel: undefined,
    white_sqr: undefined,
    black_sqr: undefined
}

initGraphics();
animate();

function loadSampleBoard() {
    Board.add_tile(1, 2, new Tile(BLACK, FLAT)); // B3
    Board.add_tile(1, 3, new Tile(WHITE, STAND)); // B4
    // Board.add_tile(1, 2, new Tile(WHITE, CAP));   B3
    Board.add_tile(1, 2, new Tile(WHITE, FLAT));
    Board.add_tile(1, 2, new Tile(BLACK, FLAT));
}

function load_models() {
    var mtl = new THREE.MTLLoader().setPath('images/tiles/3d/');
    var obj = new THREE.OBJLoader().setPath('images/tiles/3d/');
    var loader = new THREE.TextureLoader();

    models.white_sqr = new THREE.MeshBasicMaterial({
        map: loader.load("images/tiles/white_simple_pieces.png", () => {}), name: "white square"
    });

    models.black_sqr = new THREE.MeshBasicMaterial({
        map: loader.load("images/tiles/black_simple_pieces.png", () => {}), name: "black square"
    });

    models.board_sqr = new THREE.MeshBasicMaterial({
        map: loader.load("images/tiles/white_simple.png", () => {})
    });

    // White capstone model
    mtl.load('rook-small-door-matte.mtl', function(materials) {
        materials.preload();
        obj.setMaterials(materials).load('rook-small-door-matte.obj', function(model) {
            models.capModel = model;
            modelsLoaded = true;
            onModelLoad();
        });
    });
}

function onModelLoad() {
    Board.init(5, "white");
    Board.create();

    loadSampleBoard();
    for (idx in Board.objects) {
        var obj = Board.objects[idx];
        obj.receiveShadow = true;
        obj.castShadow = true;
        scene.add(obj);
    }

    startGame();
}

function initGraphics() {

    container = document.getElementById('container');

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    container.innerHTML = "";

    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.2, 2000);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfd1e5);

    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 10
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // projector = new THREE.Projector();

    controls = new THREE.OrbitControls(camera, renderer.domElement);

    load_models();

    light = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
    light.position.set( 0, 50, 0 );
    scene.add( light );

    window.addEventListener('resize', onWindowResize, false);

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('click', onDocumentMouseClick, false);
    document.addEventListener('keyup', pressKey, false);
    // setTimeout(testMove, 3000);
}

function startGame() {
    new Player(WHITE, "Bob1");
    new Player(BLACK, "Bob2");
    Player.with_color(WHITE).activate();
}

function pressKey(event) {
    if (event.keyCode === 27) {
        Board.lifted = [];
        Board.lifted_sq = undefined;
    }
}

function onDocumentMouseMove(event) {
    event.preventDefault();
    event.stopPropagation();
    //if (event.srcElement.localName == "canvas") {
    mouse.x = ((event.clientX - renderer.domElement.offsetLeft) / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -((event.clientY - renderer.domElement.offsetTop) / renderer.domElement.clientHeight) * 2 + 1;
    //  } else {}
}

function toString(v) {
    return "[ " + v.x + ", " + v.y + ", " + v.z + " ]";
}

function onDocumentMouseClick(event) {
    mouse.x = ((event.clientX - renderer.domElement.offsetLeft) / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -((event.clientY - renderer.domElement.offsetTop) / renderer.domElement.clientHeight) * 2 + 1;

    var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
    vector.unproject(camera);
    var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    for (tile of Board.tiles)
        scene.remove(tile);

    var intersects = ray.intersectObjects(scene.children);

    for (tile of Board.tiles)
        scene.add(tile);

    if (intersects.length > 0) {
        for (obj of intersects) {
            if (obj.object.name == "tile mesh") {} else if (obj.object == Board.selected || obj.object.name == "square" || obj.object.name == "hud tile") {
                Board.click(obj.object);
                break;
                //return;
            } else {
              break;
                // return;
            }
        }
    } else {
      Board.click_off();
    }
}

function testMove() {
    Board.move(Move.create("B4>"));
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    render();
    update();
}

function update() {
    var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
    vector.unproject(camera);
    var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

    for (tile of Board.tiles)
        scene.remove(tile);

    var intersects = ray.intersectObjects(scene.children);

    for (tile of Board.tiles)
        scene.add(tile);

    if (intersects.length > 0) {
        if (intersects[0].object != INTERSECTED) {
            if (INTERSECTED)
                INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
            if (intersects[0].object.name == "square") {
                INTERSECTED = intersects[0].object;
                INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
                INTERSECTED.material.color.setHex(0xffff00);
            }
        }
    } else {
        if (INTERSECTED)
            INTERSECTED.material.color.setHex(INTERSECTED.currentHex);

        INTERSECTED = null;
    }
}

function render() {
    if (modelsLoaded) {
        var deltaTime = clock.getDelta();
        if (frame++ % 2 == 0) {
            Board.draw();
        }
        renderer.render(scene, camera);
        time += deltaTime;
    }
}