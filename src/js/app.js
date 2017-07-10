
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

  var material = new THREE.MeshPhongMaterial( { color: 0xffffff, dithering: true } );
	var geometry = new THREE.BoxGeometry( 2000, 1, 2000 );
	var floor = new THREE.Mesh( geometry, material );
	floor.position.set( 0, - 1, 0 );
	floor.receiveShadow = true;
	scene.add( floor );


  var cubeGeometry = new THREE.CubeGeometry(200, 200, 200);
  var cubeMaterial = new THREE.MeshLambertMaterial( { color:0xffffff } );

  cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
  cube.position.set(0,250,0);
  cube.castShadow = true;
  scene.add( cube );

  var light = new THREE.AmbientLight( 0xffffff, 0.3 );
  scene.add( light );

  var spotLight = new THREE.SpotLight( 0xffffff, 0.5 );
  spotLight.position.set( 100, 1000, 100 );

  spotLight.castShadow = true;

  spotLight.AmbientLight = 0.5;
  spotLight.shadow.darkness = 0.5;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;

  spotLight.shadow.camera.near = 1500;
  spotLight.shadow.camera.far = 4000;
  spotLight.shadow.camera.fov = 30;
  spotLight.decay = 2;

  scene.add( spotLight );

  lightHelper = new THREE.SpotLightHelper( spotLight );
	scene.add( lightHelper );

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

  // controls = new THREE.OrbitControls( cube );
  // controls.addEventListener( 'change', render );
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
  // cube.rotation.x += 0.005;
  // cube.rotation.y += 0.006;
  lightHelper.update();
	shadowCameraHelper.update();

  renderer.render( scene, camera );
}


// function buildGui() {
// 	gui = new dat.GUI();
// 	var params = {
// 		'light color': spotLight.color.getHex(),
// 		intensity: spotLight.intensity,
// 		distance: spotLight.distance,
// 		angle: spotLight.angle,
// 		penumbra: spotLight.penumbra,
// 		decay: spotLight.decay
// 	}
// 	gui.addColor( params, 'light color' ).onChange( function ( val ) {
// 		spotLight.color.setHex( val );
// 		render();
// 	} );
// 	gui.add( params, 'intensity', 0, 2 ).onChange( function ( val ) {
// 		spotLight.intensity = val;
// 		render();
// 	} );
// 	gui.add( params, 'distance', 50, 200 ).onChange( function ( val ) {
// 		spotLight.distance = val;
// 		render();
// 	} );
// 	gui.add( params, 'angle', 0, Math.PI / 3 ).onChange( function ( val ) {
// 		spotLight.angle = val;
// 		render();
// 	} );
// 	gui.add( params, 'penumbra', 0, 1 ).onChange( function ( val ) {
// 		spotLight.penumbra = val;
// 		render();
// 	} );
// 	gui.add( params, 'decay', 1, 2 ).onChange( function ( val ) {
// 		spotLight.decay = val;
// 		render();
// 	} );
// 	gui.open();
// }

  // function render() {
  //   // cube.rotation.x += 0.005;
  //   // cube.rotation.y += 0.006;
  //   renderer.render(scene, camera);
  //   controls.update();
  //   requestAnimationFrame(render);
  //
  // }

  // requestAnimationFrame(render);


  //
  // var renderer = new THREE.WebGLRenderer({canvas: document.getElementById('canvas'), antialias: true});
  // renderer.setClearColor(0xe1f2e8);
  // renderer.setPixelRatio(window.devicePixelRatio);
  // renderer.setSize(window.innerWidth, window.innerHeight);
  //
  // var camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 3000);
  // camera.position.set(0,0,0);
  //
  // var scene = new THREE.Scene();
  // var light = new THREE.AmbientLight(0xffffff, 0.5);
  // scene.add(light);
  //
  // var pointLight = new THREE.PointLight(0xffffff, 0.5);
  // scene.add(pointLight);
  //
  // var controls = new THREE.OrbitControls( camera, renderer.domElement );
  // controls.addEventListener( 'change', renderer );
  //
  // console.log(controls);
  //
  // var plane = new THREE.GridHelper(100, 100);
  // scene.add(plane);
  //
  //
  // var geometry = new THREE.CubeGeometry(120, 120, 120);
  // var material = new THREE.MeshLambertMaterial({color:"aquamarine", wireframe:false});
  // var cube = new THREE.Mesh(geometry, material);
  // cube.position.set(0,0,-1000);
  //
  // scene.add(cube);
  //
  // function render() {
  //   // cube.rotation.x += 0.005;
  //   // cube.rotation.y += 0.006;
  //   renderer.render(scene, camera);
  //   controls.update();
  //   requestAnimationFrame(render);
  //
  // }
  //
  // requestAnimationFrame(render);



};
