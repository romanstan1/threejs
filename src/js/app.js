
window.onload = function () {
  var renderer = new THREE.WebGLRenderer({canvas: document.getElementById('canvas'), antialias: true});
  renderer.setClearColor(0xe1f2e8);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  var camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 3000);
  camera.position.set(0,0,0);

  var scene = new THREE.Scene();
  var light = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(light);

  var pointLight = new THREE.PointLight(0xffffff, 0.5);
  scene.add(pointLight);

  // var controls = new THREE.OrbitControls( camera );
  // controls.addEventListener( 'change', renderer );

  var plane = new THREE.GridHelper(100, 100);
  scene.add(plane);


  var geometry = new THREE.CubeGeometry(120, 120, 120);
  var material = new THREE.MeshLambertMaterial({color:"aquamarine", wireframe:false});
  var cube = new THREE.Mesh(geometry, material);
  cube.position.set(0,0,-1000);

  scene.add(cube);

  function render() {
    cube.rotation.x += 0.005;
    cube.rotation.y += 0.006;
    renderer.render(scene, camera);
    requestAnimationFrame(render);

  }

  requestAnimationFrame(render);






  console.log(window);


};
