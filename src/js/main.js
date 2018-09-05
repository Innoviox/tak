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
var keyboard = new THREEx.KeyboardState();
var projector,
    mouse = {
        x: 0,
        y: 0
    },
    INTERSECTED;

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
        obj.setMaterials(materials).load('rook-small-door-matte.obj', function(model) {
            materials.preload();
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

    projector = new THREE.Projector();

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

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mousedown', onDocumentMouseDown, false);

    setTimeout(testMove, 3000);

}

function onDocumentMouseMove(event) {
    // the following line would stop any other event handler from firing
    // (such as the mouse's TrackballControls)
    // event.preventDefault();

    // update the mouse variable
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function toString(v) {
    return "[ " + v.x + ", " + v.y + ", " + v.z + " ]";
}

function onDocumentMouseDown(event) {
    // the following line would stop any other event handler from firing
    // (such as the mouse's TrackballControls)
    // event.preventDefault();

    console.log("Click.");

    // update the mouse variable
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // find intersections
    // create a Ray with origin at the mouse position
    //   and direction into the scene (camera direction)
    var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
    vector.unproject(camera);
    var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    // create an array containing all objects in the scene with which the ray intersects
    for (tile of Board.tiles)
        scene.remove(tile);

    var intersects = ray.intersectObjects(scene.children);

    for (tile of Board.tiles)
        scene.add(tile);

    // if there is one (or more) intersections
    if (intersects.length > 0) {
        console.log(intersects);
        console.log("Hit @ " + toString(intersects[0].point));
        // change the color of the closest face.
        intersects[0].face.color.setRGB(0.8 * Math.random() + 0.2, 0, 0);
        intersects[0].object.geometry.colorsNeedUpdate = true;
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
    stats.update();
    update();
}

function update() {
    // find intersections

    // create a Ray with origin at the mouse position
    //   and direction into the scene (camera direction)
    var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
    // projector.unprojectVector( vector, camera );
    vector.unproject(camera);
    var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

    // create an array containing all objects in the scene with which the ray intersects
    for (tile of Board.tiles)
        scene.remove(tile);

    var intersects = ray.intersectObjects(scene.children);

    for (tile of Board.tiles)
        scene.add(tile);

    // INTERSECTED = the object in the scene currently closest to the camera
    //		and intersected by the Ray projected from the mouse position

    // if there is one (or more) intersections
    if (intersects.length > 0) {
        // if the closest object intersected is not the currently stored intersection object
        if (intersects[0].object != INTERSECTED) {
            // restore previous intersection object (if it exists) to its original color
            if (INTERSECTED)
                INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
            if (intersects[0].object.name == "square") {
                // store reference to closest object as current intersection object
                INTERSECTED = intersects[0].object;
                // store color of closest object (for later restoration)
                INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
                // set a new color for closest object
                INTERSECTED.material.color.setHex(0xffff00);
            }
        }
    } else { // there are no intersections
        // restore previous intersection object (if it exists) to its original color
        if (INTERSECTED)
            INTERSECTED.material.color.setHex(INTERSECTED.currentHex);

        // remove previous intersection object reference
        //     by setting current intersection object to "nothing"
        INTERSECTED = null;
    }
}
function render() {
    if (modelsLoaded) {
        var deltaTime = clock.getDelta();
        // ViewBoard.draw();
        if (frame++ % 2 == 0) {
            Board.draw();
        }
        renderer.render(scene, camera);
        time += deltaTime;
    }
}
