'use strict';

window.onload = function () {

  var container, camera, controls, scene, renderer, cube;

  init();
  animate();

  function init() {

    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 3000);
    camera.position.z = 500;

    controls = new THREE.OrbitControls(camera);
    controls.addEventListener('change', render);

    scene = new THREE.Scene();

    var geometry = new THREE.CubeGeometry(120, 120, 120);
    var material = new THREE.MeshLambertMaterial({ color: 0xffffff });

    cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 0, 0);
    scene.add(cube);

    var light = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(light);

    var pointLight = new THREE.PointLight(0xffffff, 0.5);
    // pointLight.position.set( 1, 1, 1 );
    scene.add(pointLight);

    light = new THREE.DirectionalLight(0x002288);
    // light.position.set( -1, -1, -1 );
    scene.add(light);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0xd5efe1);
    renderer.setSize(window.innerWidth, window.innerHeight);

    container = document.getElementById('canvas');
    container.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
  }

  function render() {
    // cube.rotation.x += 0.005;
    // cube.rotation.y += 0.006;
    renderer.render(scene, camera);
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
'use strict';

/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 */

THREE.OrbitControls = function (object, domElement) {

	this.object = object;
	this.domElement = domElement !== undefined ? domElement : document;

	// API

	this.enabled = true;

	this.center = new THREE.Vector3();

	this.userZoom = true;
	this.userZoomSpeed = 1.0;

	this.userRotate = true;
	this.userRotateSpeed = 1.0;

	this.userPan = true;
	this.userPanSpeed = 2.0;

	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	this.minDistance = 0;
	this.maxDistance = Infinity;

	// 65 /*A*/, 83 /*S*/, 68 /*D*/
	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40, ROTATE: 65, ZOOM: 83, PAN: 68 };

	// internals

	var scope = this;

	var EPS = 0.000001;
	var PIXELS_PER_ROUND = 1800;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	var zoomStart = new THREE.Vector2();
	var zoomEnd = new THREE.Vector2();
	var zoomDelta = new THREE.Vector2();

	var phiDelta = 0;
	var thetaDelta = 0;
	var scale = 1;

	var lastPosition = new THREE.Vector3();

	var STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2 };
	var state = STATE.NONE;

	// events

	var changeEvent = { type: 'change' };

	this.rotateLeft = function (angle) {

		if (angle === undefined) {

			angle = getAutoRotationAngle();
		}

		thetaDelta -= angle;
	};

	this.rotateRight = function (angle) {

		if (angle === undefined) {

			angle = getAutoRotationAngle();
		}

		thetaDelta += angle;
	};

	this.rotateUp = function (angle) {

		if (angle === undefined) {

			angle = getAutoRotationAngle();
		}

		phiDelta -= angle;
	};

	this.rotateDown = function (angle) {

		if (angle === undefined) {

			angle = getAutoRotationAngle();
		}

		phiDelta += angle;
	};

	this.zoomIn = function (zoomScale) {

		if (zoomScale === undefined) {

			zoomScale = getZoomScale();
		}

		scale /= zoomScale;
	};

	this.zoomOut = function (zoomScale) {

		if (zoomScale === undefined) {

			zoomScale = getZoomScale();
		}

		scale *= zoomScale;
	};

	this.pan = function (distance) {

		distance.transformDirection(this.object.matrix);
		distance.multiplyScalar(scope.userPanSpeed);

		this.object.position.add(distance);
		this.center.add(distance);
	};

	this.update = function () {

		var position = this.object.position;
		var offset = position.clone().sub(this.center);

		// angle from z-axis around y-axis

		var theta = Math.atan2(offset.x, offset.z);

		// angle from y-axis

		var phi = Math.atan2(Math.sqrt(offset.x * offset.x + offset.z * offset.z), offset.y);

		if (this.autoRotate) {

			this.rotateLeft(getAutoRotationAngle());
		}

		theta += thetaDelta;
		phi += phiDelta;

		// restrict phi to be between desired limits
		phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, phi));

		// restrict phi to be betwee EPS and PI-EPS
		phi = Math.max(EPS, Math.min(Math.PI - EPS, phi));

		var radius = offset.length() * scale;

		// restrict radius to be between desired limits
		radius = Math.max(this.minDistance, Math.min(this.maxDistance, radius));

		offset.x = radius * Math.sin(phi) * Math.sin(theta);
		offset.y = radius * Math.cos(phi);
		offset.z = radius * Math.sin(phi) * Math.cos(theta);

		position.copy(this.center).add(offset);

		this.object.lookAt(this.center);

		thetaDelta = 0;
		phiDelta = 0;
		scale = 1;

		if (lastPosition.distanceTo(this.object.position) > 0) {

			this.dispatchEvent(changeEvent);

			lastPosition.copy(this.object.position);
		}
	};

	function getAutoRotationAngle() {

		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
	}

	function getZoomScale() {

		return Math.pow(0.95, scope.userZoomSpeed);
	}

	function onMouseDown(event) {

		if (scope.enabled === false) return;
		if (scope.userRotate === false) return;

		event.preventDefault();

		if (state === STATE.NONE) {
			if (event.button === 0) state = STATE.ROTATE;
			if (event.button === 1) state = STATE.ZOOM;
			if (event.button === 2) state = STATE.PAN;
		}

		if (state === STATE.ROTATE) {

			//state = STATE.ROTATE;

			rotateStart.set(event.clientX, event.clientY);
		} else if (state === STATE.ZOOM) {

			//state = STATE.ZOOM;

			zoomStart.set(event.clientX, event.clientY);
		} else if (state === STATE.PAN) {

			//state = STATE.PAN;

		}

		document.addEventListener('mousemove', onMouseMove, false);
		document.addEventListener('mouseup', onMouseUp, false);
	}

	function onMouseMove(event) {

		if (scope.enabled === false) return;

		event.preventDefault();

		if (state === STATE.ROTATE) {

			rotateEnd.set(event.clientX, event.clientY);
			rotateDelta.subVectors(rotateEnd, rotateStart);

			scope.rotateLeft(2 * Math.PI * rotateDelta.x / PIXELS_PER_ROUND * scope.userRotateSpeed);
			scope.rotateUp(2 * Math.PI * rotateDelta.y / PIXELS_PER_ROUND * scope.userRotateSpeed);

			rotateStart.copy(rotateEnd);
		} else if (state === STATE.ZOOM) {

			zoomEnd.set(event.clientX, event.clientY);
			zoomDelta.subVectors(zoomEnd, zoomStart);

			if (zoomDelta.y > 0) {

				scope.zoomIn();
			} else {

				scope.zoomOut();
			}

			zoomStart.copy(zoomEnd);
		} else if (state === STATE.PAN) {

			var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
			var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

			scope.pan(new THREE.Vector3(-movementX, movementY, 0));
		}
	}

	function onMouseUp(event) {

		if (scope.enabled === false) return;
		if (scope.userRotate === false) return;

		document.removeEventListener('mousemove', onMouseMove, false);
		document.removeEventListener('mouseup', onMouseUp, false);

		state = STATE.NONE;
	}

	function onMouseWheel(event) {

		if (scope.enabled === false) return;
		if (scope.userZoom === false) return;

		var delta = 0;

		if (event.wheelDelta) {
			// WebKit / Opera / Explorer 9

			delta = event.wheelDelta;
		} else if (event.detail) {
			// Firefox

			delta = -event.detail;
		}

		if (delta > 0) {

			scope.zoomOut();
		} else {

			scope.zoomIn();
		}
	}

	function onKeyDown(event) {

		if (scope.enabled === false) return;
		if (scope.userPan === false) return;

		switch (event.keyCode) {

			/*case scope.keys.UP:
   	scope.pan( new THREE.Vector3( 0, 1, 0 ) );
   	break;
   case scope.keys.BOTTOM:
   	scope.pan( new THREE.Vector3( 0, - 1, 0 ) );
   	break;
   case scope.keys.LEFT:
   	scope.pan( new THREE.Vector3( - 1, 0, 0 ) );
   	break;
   case scope.keys.RIGHT:
   	scope.pan( new THREE.Vector3( 1, 0, 0 ) );
   	break;
   */
			case scope.keys.ROTATE:
				state = STATE.ROTATE;
				break;
			case scope.keys.ZOOM:
				state = STATE.ZOOM;
				break;
			case scope.keys.PAN:
				state = STATE.PAN;
				break;

		}
	}

	function onKeyUp(event) {

		switch (event.keyCode) {

			case scope.keys.ROTATE:
			case scope.keys.ZOOM:
			case scope.keys.PAN:
				state = STATE.NONE;
				break;
		}
	}

	this.domElement.addEventListener('contextmenu', function (event) {
		event.preventDefault();
	}, false);
	this.domElement.addEventListener('mousedown', onMouseDown, false);
	this.domElement.addEventListener('mousewheel', onMouseWheel, false);
	this.domElement.addEventListener('DOMMouseScroll', onMouseWheel, false); // firefox
	window.addEventListener('keydown', onKeyDown, false);
	window.addEventListener('keyup', onKeyUp, false);
};

THREE.OrbitControls.prototype = Object.create(THREE.EventDispatcher.prototype);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcHAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKCkge1xuXG4gIHZhciBjb250YWluZXIsIGNhbWVyYSwgY29udHJvbHMsIHNjZW5lLCByZW5kZXJlciwgY3ViZTtcblxuICBpbml0KCk7XG4gIGFuaW1hdGUoKTtcblxuICBmdW5jdGlvbiBpbml0KCkge1xuXG4gICAgY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDM1LCB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodCwgMC4xLCAzMDAwKTtcbiAgICBjYW1lcmEucG9zaXRpb24ueiA9IDUwMDtcblxuICAgIGNvbnRyb2xzID0gbmV3IFRIUkVFLk9yYml0Q29udHJvbHMoY2FtZXJhKTtcbiAgICBjb250cm9scy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCByZW5kZXIpO1xuXG4gICAgc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcblxuICAgIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5DdWJlR2VvbWV0cnkoMTIwLCAxMjAsIDEyMCk7XG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoeyBjb2xvcjogMHhmZmZmZmYgfSk7XG5cbiAgICBjdWJlID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcbiAgICBjdWJlLnBvc2l0aW9uLnNldCgwLCAwLCAwKTtcbiAgICBzY2VuZS5hZGQoY3ViZSk7XG5cbiAgICB2YXIgbGlnaHQgPSBuZXcgVEhSRUUuQW1iaWVudExpZ2h0KDB4ZmZmZmZmLCAwLjUpO1xuICAgIHNjZW5lLmFkZChsaWdodCk7XG5cbiAgICB2YXIgcG9pbnRMaWdodCA9IG5ldyBUSFJFRS5Qb2ludExpZ2h0KDB4ZmZmZmZmLCAwLjUpO1xuICAgIC8vIHBvaW50TGlnaHQucG9zaXRpb24uc2V0KCAxLCAxLCAxICk7XG4gICAgc2NlbmUuYWRkKHBvaW50TGlnaHQpO1xuXG4gICAgbGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweDAwMjI4OCk7XG4gICAgLy8gbGlnaHQucG9zaXRpb24uc2V0KCAtMSwgLTEsIC0xICk7XG4gICAgc2NlbmUuYWRkKGxpZ2h0KTtcblxuICAgIHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoeyBhbnRpYWxpYXM6IHRydWUgfSk7XG4gICAgcmVuZGVyZXIuc2V0Q2xlYXJDb2xvcigweGQ1ZWZlMSk7XG4gICAgcmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcblxuICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQocmVuZGVyZXIuZG9tRWxlbWVudCk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIG9uV2luZG93UmVzaXplLCBmYWxzZSk7XG4gIH1cblxuICBmdW5jdGlvbiBvbldpbmRvd1Jlc2l6ZSgpIHtcbiAgICBjYW1lcmEuYXNwZWN0ID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgY2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcbiAgICByZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgIHJlbmRlcigpO1xuICB9XG5cbiAgZnVuY3Rpb24gYW5pbWF0ZSgpIHtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSk7XG4gICAgY29udHJvbHMudXBkYXRlKCk7XG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgLy8gY3ViZS5yb3RhdGlvbi54ICs9IDAuMDA1O1xuICAgIC8vIGN1YmUucm90YXRpb24ueSArPSAwLjAwNjtcbiAgICByZW5kZXJlci5yZW5kZXIoc2NlbmUsIGNhbWVyYSk7XG4gIH1cblxuICAvLyBmdW5jdGlvbiByZW5kZXIoKSB7XG4gIC8vICAgLy8gY3ViZS5yb3RhdGlvbi54ICs9IDAuMDA1O1xuICAvLyAgIC8vIGN1YmUucm90YXRpb24ueSArPSAwLjAwNjtcbiAgLy8gICByZW5kZXJlci5yZW5kZXIoc2NlbmUsIGNhbWVyYSk7XG4gIC8vICAgY29udHJvbHMudXBkYXRlKCk7XG4gIC8vICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XG4gIC8vXG4gIC8vIH1cblxuICAvLyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTtcblxuXG4gIC8vXG4gIC8vIHZhciByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHtjYW52YXM6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKSwgYW50aWFsaWFzOiB0cnVlfSk7XG4gIC8vIHJlbmRlcmVyLnNldENsZWFyQ29sb3IoMHhlMWYyZTgpO1xuICAvLyByZW5kZXJlci5zZXRQaXhlbFJhdGlvKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvKTtcbiAgLy8gcmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcbiAgLy9cbiAgLy8gdmFyIGNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSgzNSwgd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQsIDAuMSwgMzAwMCk7XG4gIC8vIGNhbWVyYS5wb3NpdGlvbi5zZXQoMCwwLDApO1xuICAvL1xuICAvLyB2YXIgc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcbiAgLy8gdmFyIGxpZ2h0ID0gbmV3IFRIUkVFLkFtYmllbnRMaWdodCgweGZmZmZmZiwgMC41KTtcbiAgLy8gc2NlbmUuYWRkKGxpZ2h0KTtcbiAgLy9cbiAgLy8gdmFyIHBvaW50TGlnaHQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgweGZmZmZmZiwgMC41KTtcbiAgLy8gc2NlbmUuYWRkKHBvaW50TGlnaHQpO1xuICAvL1xuICAvLyB2YXIgY29udHJvbHMgPSBuZXcgVEhSRUUuT3JiaXRDb250cm9scyggY2FtZXJhLCByZW5kZXJlci5kb21FbGVtZW50ICk7XG4gIC8vIGNvbnRyb2xzLmFkZEV2ZW50TGlzdGVuZXIoICdjaGFuZ2UnLCByZW5kZXJlciApO1xuICAvL1xuICAvLyBjb25zb2xlLmxvZyhjb250cm9scyk7XG4gIC8vXG4gIC8vIHZhciBwbGFuZSA9IG5ldyBUSFJFRS5HcmlkSGVscGVyKDEwMCwgMTAwKTtcbiAgLy8gc2NlbmUuYWRkKHBsYW5lKTtcbiAgLy9cbiAgLy9cbiAgLy8gdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkN1YmVHZW9tZXRyeSgxMjAsIDEyMCwgMTIwKTtcbiAgLy8gdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe2NvbG9yOlwiYXF1YW1hcmluZVwiLCB3aXJlZnJhbWU6ZmFsc2V9KTtcbiAgLy8gdmFyIGN1YmUgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xuICAvLyBjdWJlLnBvc2l0aW9uLnNldCgwLDAsLTEwMDApO1xuICAvL1xuICAvLyBzY2VuZS5hZGQoY3ViZSk7XG4gIC8vXG4gIC8vIGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgLy8gICAvLyBjdWJlLnJvdGF0aW9uLnggKz0gMC4wMDU7XG4gIC8vICAgLy8gY3ViZS5yb3RhdGlvbi55ICs9IDAuMDA2O1xuICAvLyAgIHJlbmRlcmVyLnJlbmRlcihzY2VuZSwgY2FtZXJhKTtcbiAgLy8gICBjb250cm9scy51cGRhdGUoKTtcbiAgLy8gICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTtcbiAgLy9cbiAgLy8gfVxuICAvL1xuICAvLyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTtcblxufTtcbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBAYXV0aG9yIHFpYW8gLyBodHRwczovL2dpdGh1Yi5jb20vcWlhb1xuICogQGF1dGhvciBtcmRvb2IgLyBodHRwOi8vbXJkb29iLmNvbVxuICogQGF1dGhvciBhbHRlcmVkcSAvIGh0dHA6Ly9hbHRlcmVkcXVhbGlhLmNvbS9cbiAqIEBhdXRob3IgV2VzdExhbmdsZXkgLyBodHRwOi8vZ2l0aHViLmNvbS9XZXN0TGFuZ2xleVxuICovXG5cblRIUkVFLk9yYml0Q29udHJvbHMgPSBmdW5jdGlvbiAob2JqZWN0LCBkb21FbGVtZW50KSB7XG5cblx0dGhpcy5vYmplY3QgPSBvYmplY3Q7XG5cdHRoaXMuZG9tRWxlbWVudCA9IGRvbUVsZW1lbnQgIT09IHVuZGVmaW5lZCA/IGRvbUVsZW1lbnQgOiBkb2N1bWVudDtcblxuXHQvLyBBUElcblxuXHR0aGlzLmVuYWJsZWQgPSB0cnVlO1xuXG5cdHRoaXMuY2VudGVyID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuXHR0aGlzLnVzZXJab29tID0gdHJ1ZTtcblx0dGhpcy51c2VyWm9vbVNwZWVkID0gMS4wO1xuXG5cdHRoaXMudXNlclJvdGF0ZSA9IHRydWU7XG5cdHRoaXMudXNlclJvdGF0ZVNwZWVkID0gMS4wO1xuXG5cdHRoaXMudXNlclBhbiA9IHRydWU7XG5cdHRoaXMudXNlclBhblNwZWVkID0gMi4wO1xuXG5cdHRoaXMuYXV0b1JvdGF0ZSA9IGZhbHNlO1xuXHR0aGlzLmF1dG9Sb3RhdGVTcGVlZCA9IDIuMDsgLy8gMzAgc2Vjb25kcyBwZXIgcm91bmQgd2hlbiBmcHMgaXMgNjBcblxuXHR0aGlzLm1pblBvbGFyQW5nbGUgPSAwOyAvLyByYWRpYW5zXG5cdHRoaXMubWF4UG9sYXJBbmdsZSA9IE1hdGguUEk7IC8vIHJhZGlhbnNcblxuXHR0aGlzLm1pbkRpc3RhbmNlID0gMDtcblx0dGhpcy5tYXhEaXN0YW5jZSA9IEluZmluaXR5O1xuXG5cdC8vIDY1IC8qQSovLCA4MyAvKlMqLywgNjggLypEKi9cblx0dGhpcy5rZXlzID0geyBMRUZUOiAzNywgVVA6IDM4LCBSSUdIVDogMzksIEJPVFRPTTogNDAsIFJPVEFURTogNjUsIFpPT006IDgzLCBQQU46IDY4IH07XG5cblx0Ly8gaW50ZXJuYWxzXG5cblx0dmFyIHNjb3BlID0gdGhpcztcblxuXHR2YXIgRVBTID0gMC4wMDAwMDE7XG5cdHZhciBQSVhFTFNfUEVSX1JPVU5EID0gMTgwMDtcblxuXHR2YXIgcm90YXRlU3RhcnQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXHR2YXIgcm90YXRlRW5kID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblx0dmFyIHJvdGF0ZURlbHRhID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblxuXHR2YXIgem9vbVN0YXJ0ID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblx0dmFyIHpvb21FbmQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXHR2YXIgem9vbURlbHRhID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblxuXHR2YXIgcGhpRGVsdGEgPSAwO1xuXHR2YXIgdGhldGFEZWx0YSA9IDA7XG5cdHZhciBzY2FsZSA9IDE7XG5cblx0dmFyIGxhc3RQb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cblx0dmFyIFNUQVRFID0geyBOT05FOiAtMSwgUk9UQVRFOiAwLCBaT09NOiAxLCBQQU46IDIgfTtcblx0dmFyIHN0YXRlID0gU1RBVEUuTk9ORTtcblxuXHQvLyBldmVudHNcblxuXHR2YXIgY2hhbmdlRXZlbnQgPSB7IHR5cGU6ICdjaGFuZ2UnIH07XG5cblx0dGhpcy5yb3RhdGVMZWZ0ID0gZnVuY3Rpb24gKGFuZ2xlKSB7XG5cblx0XHRpZiAoYW5nbGUgPT09IHVuZGVmaW5lZCkge1xuXG5cdFx0XHRhbmdsZSA9IGdldEF1dG9Sb3RhdGlvbkFuZ2xlKCk7XG5cdFx0fVxuXG5cdFx0dGhldGFEZWx0YSAtPSBhbmdsZTtcblx0fTtcblxuXHR0aGlzLnJvdGF0ZVJpZ2h0ID0gZnVuY3Rpb24gKGFuZ2xlKSB7XG5cblx0XHRpZiAoYW5nbGUgPT09IHVuZGVmaW5lZCkge1xuXG5cdFx0XHRhbmdsZSA9IGdldEF1dG9Sb3RhdGlvbkFuZ2xlKCk7XG5cdFx0fVxuXG5cdFx0dGhldGFEZWx0YSArPSBhbmdsZTtcblx0fTtcblxuXHR0aGlzLnJvdGF0ZVVwID0gZnVuY3Rpb24gKGFuZ2xlKSB7XG5cblx0XHRpZiAoYW5nbGUgPT09IHVuZGVmaW5lZCkge1xuXG5cdFx0XHRhbmdsZSA9IGdldEF1dG9Sb3RhdGlvbkFuZ2xlKCk7XG5cdFx0fVxuXG5cdFx0cGhpRGVsdGEgLT0gYW5nbGU7XG5cdH07XG5cblx0dGhpcy5yb3RhdGVEb3duID0gZnVuY3Rpb24gKGFuZ2xlKSB7XG5cblx0XHRpZiAoYW5nbGUgPT09IHVuZGVmaW5lZCkge1xuXG5cdFx0XHRhbmdsZSA9IGdldEF1dG9Sb3RhdGlvbkFuZ2xlKCk7XG5cdFx0fVxuXG5cdFx0cGhpRGVsdGEgKz0gYW5nbGU7XG5cdH07XG5cblx0dGhpcy56b29tSW4gPSBmdW5jdGlvbiAoem9vbVNjYWxlKSB7XG5cblx0XHRpZiAoem9vbVNjYWxlID09PSB1bmRlZmluZWQpIHtcblxuXHRcdFx0em9vbVNjYWxlID0gZ2V0Wm9vbVNjYWxlKCk7XG5cdFx0fVxuXG5cdFx0c2NhbGUgLz0gem9vbVNjYWxlO1xuXHR9O1xuXG5cdHRoaXMuem9vbU91dCA9IGZ1bmN0aW9uICh6b29tU2NhbGUpIHtcblxuXHRcdGlmICh6b29tU2NhbGUgPT09IHVuZGVmaW5lZCkge1xuXG5cdFx0XHR6b29tU2NhbGUgPSBnZXRab29tU2NhbGUoKTtcblx0XHR9XG5cblx0XHRzY2FsZSAqPSB6b29tU2NhbGU7XG5cdH07XG5cblx0dGhpcy5wYW4gPSBmdW5jdGlvbiAoZGlzdGFuY2UpIHtcblxuXHRcdGRpc3RhbmNlLnRyYW5zZm9ybURpcmVjdGlvbih0aGlzLm9iamVjdC5tYXRyaXgpO1xuXHRcdGRpc3RhbmNlLm11bHRpcGx5U2NhbGFyKHNjb3BlLnVzZXJQYW5TcGVlZCk7XG5cblx0XHR0aGlzLm9iamVjdC5wb3NpdGlvbi5hZGQoZGlzdGFuY2UpO1xuXHRcdHRoaXMuY2VudGVyLmFkZChkaXN0YW5jZSk7XG5cdH07XG5cblx0dGhpcy51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHR2YXIgcG9zaXRpb24gPSB0aGlzLm9iamVjdC5wb3NpdGlvbjtcblx0XHR2YXIgb2Zmc2V0ID0gcG9zaXRpb24uY2xvbmUoKS5zdWIodGhpcy5jZW50ZXIpO1xuXG5cdFx0Ly8gYW5nbGUgZnJvbSB6LWF4aXMgYXJvdW5kIHktYXhpc1xuXG5cdFx0dmFyIHRoZXRhID0gTWF0aC5hdGFuMihvZmZzZXQueCwgb2Zmc2V0LnopO1xuXG5cdFx0Ly8gYW5nbGUgZnJvbSB5LWF4aXNcblxuXHRcdHZhciBwaGkgPSBNYXRoLmF0YW4yKE1hdGguc3FydChvZmZzZXQueCAqIG9mZnNldC54ICsgb2Zmc2V0LnogKiBvZmZzZXQueiksIG9mZnNldC55KTtcblxuXHRcdGlmICh0aGlzLmF1dG9Sb3RhdGUpIHtcblxuXHRcdFx0dGhpcy5yb3RhdGVMZWZ0KGdldEF1dG9Sb3RhdGlvbkFuZ2xlKCkpO1xuXHRcdH1cblxuXHRcdHRoZXRhICs9IHRoZXRhRGVsdGE7XG5cdFx0cGhpICs9IHBoaURlbHRhO1xuXG5cdFx0Ly8gcmVzdHJpY3QgcGhpIHRvIGJlIGJldHdlZW4gZGVzaXJlZCBsaW1pdHNcblx0XHRwaGkgPSBNYXRoLm1heCh0aGlzLm1pblBvbGFyQW5nbGUsIE1hdGgubWluKHRoaXMubWF4UG9sYXJBbmdsZSwgcGhpKSk7XG5cblx0XHQvLyByZXN0cmljdCBwaGkgdG8gYmUgYmV0d2VlIEVQUyBhbmQgUEktRVBTXG5cdFx0cGhpID0gTWF0aC5tYXgoRVBTLCBNYXRoLm1pbihNYXRoLlBJIC0gRVBTLCBwaGkpKTtcblxuXHRcdHZhciByYWRpdXMgPSBvZmZzZXQubGVuZ3RoKCkgKiBzY2FsZTtcblxuXHRcdC8vIHJlc3RyaWN0IHJhZGl1cyB0byBiZSBiZXR3ZWVuIGRlc2lyZWQgbGltaXRzXG5cdFx0cmFkaXVzID0gTWF0aC5tYXgodGhpcy5taW5EaXN0YW5jZSwgTWF0aC5taW4odGhpcy5tYXhEaXN0YW5jZSwgcmFkaXVzKSk7XG5cblx0XHRvZmZzZXQueCA9IHJhZGl1cyAqIE1hdGguc2luKHBoaSkgKiBNYXRoLnNpbih0aGV0YSk7XG5cdFx0b2Zmc2V0LnkgPSByYWRpdXMgKiBNYXRoLmNvcyhwaGkpO1xuXHRcdG9mZnNldC56ID0gcmFkaXVzICogTWF0aC5zaW4ocGhpKSAqIE1hdGguY29zKHRoZXRhKTtcblxuXHRcdHBvc2l0aW9uLmNvcHkodGhpcy5jZW50ZXIpLmFkZChvZmZzZXQpO1xuXG5cdFx0dGhpcy5vYmplY3QubG9va0F0KHRoaXMuY2VudGVyKTtcblxuXHRcdHRoZXRhRGVsdGEgPSAwO1xuXHRcdHBoaURlbHRhID0gMDtcblx0XHRzY2FsZSA9IDE7XG5cblx0XHRpZiAobGFzdFBvc2l0aW9uLmRpc3RhbmNlVG8odGhpcy5vYmplY3QucG9zaXRpb24pID4gMCkge1xuXG5cdFx0XHR0aGlzLmRpc3BhdGNoRXZlbnQoY2hhbmdlRXZlbnQpO1xuXG5cdFx0XHRsYXN0UG9zaXRpb24uY29weSh0aGlzLm9iamVjdC5wb3NpdGlvbik7XG5cdFx0fVxuXHR9O1xuXG5cdGZ1bmN0aW9uIGdldEF1dG9Sb3RhdGlvbkFuZ2xlKCkge1xuXG5cdFx0cmV0dXJuIDIgKiBNYXRoLlBJIC8gNjAgLyA2MCAqIHNjb3BlLmF1dG9Sb3RhdGVTcGVlZDtcblx0fVxuXG5cdGZ1bmN0aW9uIGdldFpvb21TY2FsZSgpIHtcblxuXHRcdHJldHVybiBNYXRoLnBvdygwLjk1LCBzY29wZS51c2VyWm9vbVNwZWVkKTtcblx0fVxuXG5cdGZ1bmN0aW9uIG9uTW91c2VEb3duKGV2ZW50KSB7XG5cblx0XHRpZiAoc2NvcGUuZW5hYmxlZCA9PT0gZmFsc2UpIHJldHVybjtcblx0XHRpZiAoc2NvcGUudXNlclJvdGF0ZSA9PT0gZmFsc2UpIHJldHVybjtcblxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRpZiAoc3RhdGUgPT09IFNUQVRFLk5PTkUpIHtcblx0XHRcdGlmIChldmVudC5idXR0b24gPT09IDApIHN0YXRlID0gU1RBVEUuUk9UQVRFO1xuXHRcdFx0aWYgKGV2ZW50LmJ1dHRvbiA9PT0gMSkgc3RhdGUgPSBTVEFURS5aT09NO1xuXHRcdFx0aWYgKGV2ZW50LmJ1dHRvbiA9PT0gMikgc3RhdGUgPSBTVEFURS5QQU47XG5cdFx0fVxuXG5cdFx0aWYgKHN0YXRlID09PSBTVEFURS5ST1RBVEUpIHtcblxuXHRcdFx0Ly9zdGF0ZSA9IFNUQVRFLlJPVEFURTtcblxuXHRcdFx0cm90YXRlU3RhcnQuc2V0KGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xuXHRcdH0gZWxzZSBpZiAoc3RhdGUgPT09IFNUQVRFLlpPT00pIHtcblxuXHRcdFx0Ly9zdGF0ZSA9IFNUQVRFLlpPT007XG5cblx0XHRcdHpvb21TdGFydC5zZXQoZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSk7XG5cdFx0fSBlbHNlIGlmIChzdGF0ZSA9PT0gU1RBVEUuUEFOKSB7XG5cblx0XHRcdC8vc3RhdGUgPSBTVEFURS5QQU47XG5cblx0XHR9XG5cblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBvbk1vdXNlTW92ZSwgZmFsc2UpO1xuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBvbk1vdXNlVXAsIGZhbHNlKTtcblx0fVxuXG5cdGZ1bmN0aW9uIG9uTW91c2VNb3ZlKGV2ZW50KSB7XG5cblx0XHRpZiAoc2NvcGUuZW5hYmxlZCA9PT0gZmFsc2UpIHJldHVybjtcblxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRpZiAoc3RhdGUgPT09IFNUQVRFLlJPVEFURSkge1xuXG5cdFx0XHRyb3RhdGVFbmQuc2V0KGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xuXHRcdFx0cm90YXRlRGVsdGEuc3ViVmVjdG9ycyhyb3RhdGVFbmQsIHJvdGF0ZVN0YXJ0KTtcblxuXHRcdFx0c2NvcGUucm90YXRlTGVmdCgyICogTWF0aC5QSSAqIHJvdGF0ZURlbHRhLnggLyBQSVhFTFNfUEVSX1JPVU5EICogc2NvcGUudXNlclJvdGF0ZVNwZWVkKTtcblx0XHRcdHNjb3BlLnJvdGF0ZVVwKDIgKiBNYXRoLlBJICogcm90YXRlRGVsdGEueSAvIFBJWEVMU19QRVJfUk9VTkQgKiBzY29wZS51c2VyUm90YXRlU3BlZWQpO1xuXG5cdFx0XHRyb3RhdGVTdGFydC5jb3B5KHJvdGF0ZUVuZCk7XG5cdFx0fSBlbHNlIGlmIChzdGF0ZSA9PT0gU1RBVEUuWk9PTSkge1xuXG5cdFx0XHR6b29tRW5kLnNldChldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcblx0XHRcdHpvb21EZWx0YS5zdWJWZWN0b3JzKHpvb21FbmQsIHpvb21TdGFydCk7XG5cblx0XHRcdGlmICh6b29tRGVsdGEueSA+IDApIHtcblxuXHRcdFx0XHRzY29wZS56b29tSW4oKTtcblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0c2NvcGUuem9vbU91dCgpO1xuXHRcdFx0fVxuXG5cdFx0XHR6b29tU3RhcnQuY29weSh6b29tRW5kKTtcblx0XHR9IGVsc2UgaWYgKHN0YXRlID09PSBTVEFURS5QQU4pIHtcblxuXHRcdFx0dmFyIG1vdmVtZW50WCA9IGV2ZW50Lm1vdmVtZW50WCB8fCBldmVudC5tb3pNb3ZlbWVudFggfHwgZXZlbnQud2Via2l0TW92ZW1lbnRYIHx8IDA7XG5cdFx0XHR2YXIgbW92ZW1lbnRZID0gZXZlbnQubW92ZW1lbnRZIHx8IGV2ZW50Lm1vek1vdmVtZW50WSB8fCBldmVudC53ZWJraXRNb3ZlbWVudFkgfHwgMDtcblxuXHRcdFx0c2NvcGUucGFuKG5ldyBUSFJFRS5WZWN0b3IzKC1tb3ZlbWVudFgsIG1vdmVtZW50WSwgMCkpO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIG9uTW91c2VVcChldmVudCkge1xuXG5cdFx0aWYgKHNjb3BlLmVuYWJsZWQgPT09IGZhbHNlKSByZXR1cm47XG5cdFx0aWYgKHNjb3BlLnVzZXJSb3RhdGUgPT09IGZhbHNlKSByZXR1cm47XG5cblx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBvbk1vdXNlTW92ZSwgZmFsc2UpO1xuXHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBvbk1vdXNlVXAsIGZhbHNlKTtcblxuXHRcdHN0YXRlID0gU1RBVEUuTk9ORTtcblx0fVxuXG5cdGZ1bmN0aW9uIG9uTW91c2VXaGVlbChldmVudCkge1xuXG5cdFx0aWYgKHNjb3BlLmVuYWJsZWQgPT09IGZhbHNlKSByZXR1cm47XG5cdFx0aWYgKHNjb3BlLnVzZXJab29tID09PSBmYWxzZSkgcmV0dXJuO1xuXG5cdFx0dmFyIGRlbHRhID0gMDtcblxuXHRcdGlmIChldmVudC53aGVlbERlbHRhKSB7XG5cdFx0XHQvLyBXZWJLaXQgLyBPcGVyYSAvIEV4cGxvcmVyIDlcblxuXHRcdFx0ZGVsdGEgPSBldmVudC53aGVlbERlbHRhO1xuXHRcdH0gZWxzZSBpZiAoZXZlbnQuZGV0YWlsKSB7XG5cdFx0XHQvLyBGaXJlZm94XG5cblx0XHRcdGRlbHRhID0gLWV2ZW50LmRldGFpbDtcblx0XHR9XG5cblx0XHRpZiAoZGVsdGEgPiAwKSB7XG5cblx0XHRcdHNjb3BlLnpvb21PdXQoKTtcblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRzY29wZS56b29tSW4oKTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBvbktleURvd24oZXZlbnQpIHtcblxuXHRcdGlmIChzY29wZS5lbmFibGVkID09PSBmYWxzZSkgcmV0dXJuO1xuXHRcdGlmIChzY29wZS51c2VyUGFuID09PSBmYWxzZSkgcmV0dXJuO1xuXG5cdFx0c3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG5cblx0XHRcdC8qY2FzZSBzY29wZS5rZXlzLlVQOlxuICAgXHRzY29wZS5wYW4oIG5ldyBUSFJFRS5WZWN0b3IzKCAwLCAxLCAwICkgKTtcbiAgIFx0YnJlYWs7XG4gICBjYXNlIHNjb3BlLmtleXMuQk9UVE9NOlxuICAgXHRzY29wZS5wYW4oIG5ldyBUSFJFRS5WZWN0b3IzKCAwLCAtIDEsIDAgKSApO1xuICAgXHRicmVhaztcbiAgIGNhc2Ugc2NvcGUua2V5cy5MRUZUOlxuICAgXHRzY29wZS5wYW4oIG5ldyBUSFJFRS5WZWN0b3IzKCAtIDEsIDAsIDAgKSApO1xuICAgXHRicmVhaztcbiAgIGNhc2Ugc2NvcGUua2V5cy5SSUdIVDpcbiAgIFx0c2NvcGUucGFuKCBuZXcgVEhSRUUuVmVjdG9yMyggMSwgMCwgMCApICk7XG4gICBcdGJyZWFrO1xuICAgKi9cblx0XHRcdGNhc2Ugc2NvcGUua2V5cy5ST1RBVEU6XG5cdFx0XHRcdHN0YXRlID0gU1RBVEUuUk9UQVRFO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2Ugc2NvcGUua2V5cy5aT09NOlxuXHRcdFx0XHRzdGF0ZSA9IFNUQVRFLlpPT007XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBzY29wZS5rZXlzLlBBTjpcblx0XHRcdFx0c3RhdGUgPSBTVEFURS5QQU47XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gb25LZXlVcChldmVudCkge1xuXG5cdFx0c3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG5cblx0XHRcdGNhc2Ugc2NvcGUua2V5cy5ST1RBVEU6XG5cdFx0XHRjYXNlIHNjb3BlLmtleXMuWk9PTTpcblx0XHRcdGNhc2Ugc2NvcGUua2V5cy5QQU46XG5cdFx0XHRcdHN0YXRlID0gU1RBVEUuTk9ORTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0fSwgZmFsc2UpO1xuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Nb3VzZURvd24sIGZhbHNlKTtcblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNld2hlZWwnLCBvbk1vdXNlV2hlZWwsIGZhbHNlKTtcblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTU1vdXNlU2Nyb2xsJywgb25Nb3VzZVdoZWVsLCBmYWxzZSk7IC8vIGZpcmVmb3hcblx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleURvd24sIGZhbHNlKTtcblx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgb25LZXlVcCwgZmFsc2UpO1xufTtcblxuVEhSRUUuT3JiaXRDb250cm9scy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFRIUkVFLkV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUpOyJdLCJmaWxlIjoiYXBwLmpzIn0=
