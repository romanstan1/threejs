
window.onload = function () {

  var container, camera, controls, scene, renderer, cube, shadowCameraHelper, lightHelper;

  init();
  animate();
  move();

function init() {

  camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 0.1, 10000 );
  camera.position.z = 2000;
  camera.position.y = 1300;
  camera.position.x = 50;

  controls = new THREE.OrbitControls( camera );
  controls.addEventListener( 'change', render );

  scene = new THREE.Scene();

  var floorMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, dithering: true } );
	var floorGeometry = new THREE.BoxGeometry( 2000, 1, 2000 );
	var floor = new THREE.Mesh( floorGeometry, floorMaterial );
	floor.position.set( 0, 0, -500 );
	floor.receiveShadow = true;
	scene.add( floor );


  var cubeGeometry = new THREE.CubeGeometry(200, 200, 200);
  var cubeMaterial = new THREE.MeshStandardMaterial( { color:0xffffff } );

  cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
  cube.position.set(0,250,0);
  cube.castShadow = true;
  scene.add( cube );

  var light = new THREE.AmbientLight( 0xffffff, 0.3 );
  scene.add( light );

  var spotLight = new THREE.SpotLight( 0xffffff, 0.8 );
  spotLight.position.set( 100, 300, 700 );
  spotLight.angle = 0.75;
  spotLight.penumbra = 0.35;
  spotLight.distance = 2085;


  spotLight.castShadow = true;
  // spotLight.AmbientLight = 0.5;
  spotLight.shadow.darkness = 0.5;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  //
  spotLight.shadow.camera.near = 0.1;
  spotLight.shadow.camera.far = 2000;
  spotLight.shadow.camera.fov = 30;
  spotLight.decay = 2;

  scene.add( spotLight );

  lightHelper = new THREE.SpotLightHelper( spotLight );
	scene.add( lightHelper );
  //
  shadowCameraHelper = new THREE.CameraHelper( spotLight.shadow.camera );
	scene.add( shadowCameraHelper );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setClearColor( 0xd5efe1 );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;


  container = document.getElementById( 'canvas' );
  container.appendChild( renderer.domElement );
  window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  renderer.setSize( window.innerWidth, window.innerHeight );
  render();
}

function animate() {
  requestAnimationFrame( animate );
  controls.update();
}
function move() {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  render();

  requestAnimationFrame( move );
}

function render() {
  lightHelper.update();
	shadowCameraHelper.update();

  renderer.render( scene, camera );
}

};
