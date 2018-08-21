/*
var Detector = require(['addons/Detector.js']);
var OrbitControls = require(['addons/OrbitControls.js']);
var stats = require(['addons/stats.min.js'])
*/
/*
requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'js/addons',
});
*/
// var OrbitControls = require(['js/lib/OrbitControls.js']);
// var Detector = require(['js/lib/Detector.js']);


// - Global variables -

// Heightfield parameters
var terrainWidthExtents = 100;
var terrainDepthExtents = 100;
var terrainWidth = 128;
var terrainDepth = 128;
var terrainHalfWidth = terrainWidth / 2;
var terrainHalfDepth = terrainDepth / 2;
var terrainMaxHeight = 8;
var terrainMinHeight = -2;

// Graphics variables
var container, stats;
var camera, controls, scene, renderer;
var terrainMesh, texture;
var clock = new THREE.Clock();

// Physics variables
var collisionConfiguration;
var dispatcher;
var broadphase;
var solver;
var physicsWorld;
var terrainBody;
var dynamicObjects = [];
var transformAux1 = new Ammo.btTransform();

var heightData = null;
var ammoHeightData = null;

var time = 0;
var objectTimePeriod = 3;
var timeNextSpawn = time + objectTimePeriod;
var maxNumObjects = 30;

// - Main code -
init();
animate();

function init() {

	heightData = generateHeight( terrainWidth, terrainDepth, terrainMinHeight, terrainMaxHeight );

	initGraphics();

	initPhysics();

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

	camera.position.y = heightData[ terrainHalfWidth + terrainHalfDepth * terrainWidth ] * ( terrainMaxHeight - terrainMinHeight ) + 5;

	camera.position.z = terrainDepthExtents / 2;
	camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

	controls = new THREE.OrbitControls( camera );

	var geometry = new THREE.PlaneBufferGeometry( terrainWidthExtents, terrainDepthExtents, terrainWidth - 1, terrainDepth - 1 );
	geometry.rotateX( -Math.PI / 2 );

	var vertices = geometry.attributes.position.array;

	for ( var i = 0, j = 0, l = vertices.length; i < l; i++, j += 3 ) {

		// j + 1 because it is the y component that we modify
		vertices[ j + 1 ] = heightData[ i ];

	}

	geometry.computeVertexNormals();

	var groundMaterial = new THREE.MeshPhongMaterial( { color: 0xC7C7C7 } );
	terrainMesh = new THREE.Mesh( geometry, groundMaterial );
	terrainMesh.receiveShadow = true;
	terrainMesh.castShadow = true;

	scene.add( terrainMesh );

	var textureLoader = new THREE.TextureLoader();
	textureLoader.load("textures/grid.png", function ( texture ) {
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( terrainWidth - 1, terrainDepth - 1 );
		groundMaterial.map = texture;
		groundMaterial.needsUpdate = true;

	});

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

function initPhysics() {

	// Physics configuration

	collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
	dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
	broadphase = new Ammo.btDbvtBroadphase();
	solver = new Ammo.btSequentialImpulseConstraintSolver();
	physicsWorld = new Ammo.btDiscreteDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration );
	physicsWorld.setGravity( new Ammo.btVector3( 0, -6, 0 ) );

	// Create the terrain body

	var groundShape = this.createTerrainShape( heightData );
	var groundTransform = new Ammo.btTransform();
	groundTransform.setIdentity();
	// Shifts the terrain, since bullet re-centers it on its bounding box.
	groundTransform.setOrigin( new Ammo.btVector3( 0, ( terrainMaxHeight + terrainMinHeight ) / 2, 0 ) );
	var groundMass = 0;
	var groundLocalInertia = new Ammo.btVector3( 0, 0, 0 );
	var groundMotionState = new Ammo.btDefaultMotionState( groundTransform );
	var groundBody = new Ammo.btRigidBody( new Ammo.btRigidBodyConstructionInfo( groundMass, groundMotionState, groundShape, groundLocalInertia ) );
	physicsWorld.addRigidBody( groundBody );

}

function generateHeight( width, depth, minHeight, maxHeight ) {

	// Generates the height data (a sinus wave)

	var size = width * depth;
	var data = new Float32Array(size);

	var hRange = maxHeight - minHeight;
	var w2 = width / 2;
	var d2 = depth / 2;
	var phaseMult = 12;

	var p = 0;
	for ( var j = 0; j < depth; j++ ) {
		for ( var i = 0; i < width; i++ ) {

			var radius = Math.sqrt(
					Math.pow( ( i - w2 ) / w2, 2.0 ) +
					Math.pow( ( j - d2 ) / d2, 2.0 ) );

			var height = ( Math.sin( radius * phaseMult ) + 1 ) * 0.5 * hRange + minHeight;

			data[ p ] = height;

			p++;
		}
	}

	return data;

}

function createTerrainShape() {

	// This parameter is not really used, since we are using PHY_FLOAT height data type and hence it is ignored
	var heightScale = 1;

	// Up axis = 0 for X, 1 for Y, 2 for Z. Normally 1 = Y is used.
	var upAxis = 1;

	// hdt, height data type. "PHY_FLOAT" is used. Possible values are "PHY_FLOAT", "PHY_UCHAR", "PHY_SHORT"
	var hdt = "PHY_FLOAT";

	// Set this to your needs (inverts the triangles)
	var flipQuadEdges = false;

	// Creates height data buffer in Ammo heap
	ammoHeightData = Ammo._malloc(4 * terrainWidth * terrainDepth);

	// Copy the javascript height data array to the Ammo one.
	var p = 0;
	var p2 = 0;
	for ( var j = 0; j < terrainDepth; j++ ) {
		for ( var i = 0; i < terrainWidth; i++ ) {

			// write 32-bit float data to memory
			Ammo.HEAPF32[ ammoHeightData + p2 >> 2 ] = heightData[ p ];

			p++;

			// 4 bytes/float
			p2 += 4;
		}
	}

	// Creates the heightfield physics shape
	var heightFieldShape = new Ammo.btHeightfieldTerrainShape(
		terrainWidth,
		terrainDepth,
		ammoHeightData,
		heightScale,
		terrainMinHeight,
		terrainMaxHeight,
		upAxis,
		hdt,
		flipQuadEdges
		);

	// Set horizontal scale
	var scaleX = terrainWidthExtents / ( terrainWidth - 1 );
	var scaleZ = terrainDepthExtents / ( terrainDepth - 1 );
	heightFieldShape.setLocalScaling( new Ammo.btVector3( scaleX, 1, scaleZ ) );

	heightFieldShape.setMargin( 0.05 );

	return heightFieldShape;

}

function generateObject() {

	var numTypes = 4;
	var objectType = Math.ceil( Math.random() * numTypes );

	var threeObject = null;
	var shape = null;

	var objectSize = 3;
	var margin = 0.05;

	switch (objectType) {
		case 1:
			// Sphere
			var radius = 1 + Math.random() * objectSize;
			threeObject = new THREE.Mesh( new THREE.SphereBufferGeometry( radius, 20, 20 ), createObjectMaterial() );
			shape = new Ammo.btSphereShape( radius );
			shape.setMargin( margin );
			break;
		case 2:
			// Box
			var sx = 1 + Math.random() * objectSize;
			var sy = 1 + Math.random() * objectSize;
			var sz = 1 + Math.random() * objectSize;
			threeObject = new THREE.Mesh( new THREE.BoxBufferGeometry( sx, sy, sz, 1, 1, 1 ), createObjectMaterial() );
			shape = new Ammo.btBoxShape( new Ammo.btVector3( sx * 0.5, sy * 0.5, sz * 0.5 ) );
			shape.setMargin( margin );
			break;
		case 3:
			// Cylinder
			var radius = 1 + Math.random() * objectSize;
			var height = 1 + Math.random() * objectSize;
			threeObject = new THREE.Mesh( new THREE.CylinderBufferGeometry( radius, radius, height, 20, 1 ), createObjectMaterial() );
			shape = new Ammo.btCylinderShape( new Ammo.btVector3( radius, height * 0.5, radius ) );
			shape.setMargin(margin);
			break;
		default:
			// Cone
			var radius = 1 + Math.random() * objectSize;
			var height = 2 + Math.random() * objectSize;
			threeObject = new THREE.Mesh( new THREE.ConeBufferGeometry( radius, height, 20, 2 ), createObjectMaterial() );
			shape = new Ammo.btConeShape( radius, height );
			break;
	}

	threeObject.position.set( ( Math.random() - 0.5 ) * terrainWidth * 0.6, terrainMaxHeight + objectSize + 2, ( Math.random() - 0.5 ) * terrainDepth * 0.6 );

	var mass = objectSize * 5;
	var localInertia = new Ammo.btVector3( 0, 0, 0 );
	shape.calculateLocalInertia( mass, localInertia );
	var transform = new Ammo.btTransform();
	transform.setIdentity();
	var pos = threeObject.position;
	transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
	var motionState = new Ammo.btDefaultMotionState( transform );
	var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, shape, localInertia );
	var body = new Ammo.btRigidBody( rbInfo );

	threeObject.userData.physicsBody = body;

	threeObject.receiveShadow = true;
	threeObject.castShadow = true;

	scene.add( threeObject );
	dynamicObjects.push( threeObject );

	physicsWorld.addRigidBody( body );



}

function createObjectMaterial() {
	var c = Math.floor( Math.random() * ( 1 << 24 ) );
	return new THREE.MeshPhongMaterial( { color: c } );
}

function animate() {

	requestAnimationFrame(animate);

	render();
	stats.update();

}

function render() {

	var deltaTime = clock.getDelta();

	if ( dynamicObjects.length < maxNumObjects && time > timeNextSpawn ) {
		generateObject();
		timeNextSpawn = time + objectTimePeriod;
	}

	updatePhysics( deltaTime );

	renderer.render( scene, camera );

	time += deltaTime;

}

function updatePhysics( deltaTime ) {

	physicsWorld.stepSimulation( deltaTime, 10 );

	// Update objects
	for ( var i = 0, il = dynamicObjects.length; i < il; i++ ) {
		var objThree = dynamicObjects[ i ];
		var objPhys = objThree.userData.physicsBody;
		var ms = objPhys.getMotionState();
		if ( ms ) {

			ms.getWorldTransform( transformAux1 );
			var p = transformAux1.getOrigin();
			var q = transformAux1.getRotation();
			objThree.position.set( p.x(), p.y(), p.z() );
			objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

		}
	}
}
