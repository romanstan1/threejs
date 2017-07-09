

window.onload = function () {

  var container, camera, controls, scene, renderer, cube;

  init();
  animate();

function init() {

  camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 0.1, 3000 );
  camera.position.z = 500;

  controls = new THREE.OrbitControls( camera );
  controls.addEventListener( 'change', render );

  scene = new THREE.Scene();

  var geometry = new THREE.CubeGeometry(120, 120, 120);
  var material = new THREE.MeshLambertMaterial( { color:0xffffff } );

  cube = new THREE.Mesh( geometry, material );
  cube.position.set(0,0,0);
  scene.add( cube );

  var light = new THREE.AmbientLight( 0xffffff, 0.5 );
  scene.add( light );

  var pointLight = new THREE.PointLight( 0xffffff, 0.5 );
  // pointLight.position.set( 1, 1, 1 );
  scene.add( pointLight );

  light = new THREE.DirectionalLight( 0x002288 );
  // light.position.set( -1, -1, -1 );
  scene.add( light );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setClearColor( 0xd5efe1 );
  renderer.setSize( window.innerWidth, window.innerHeight );

  container = document.getElementById( 'canvas' );
  container.appendChild( renderer.domElement );
  window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
  render();
}

function animate() {
  requestAnimationFrame( animate );
  controls.update();
}

function render() {
  // cube.rotation.x += 0.005;
  // cube.rotation.y += 0.006;
  renderer.render( scene, camera );
}

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
