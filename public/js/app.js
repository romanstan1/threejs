"use strict";

window.onload = function () {
  var renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), antialias: true });
  renderer.setClearColor(0xe1f2e8);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  var camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 3000);
  camera.position.set(0, 0, 0);

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
  var material = new THREE.MeshLambertMaterial({ color: "aquamarine", wireframe: false });
  var cube = new THREE.Mesh(geometry, material);
  cube.position.set(0, 0, -1000);

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcHAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHsgY2FudmFzOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJyksIGFudGlhbGlhczogdHJ1ZSB9KTtcbiAgcmVuZGVyZXIuc2V0Q2xlYXJDb2xvcigweGUxZjJlOCk7XG4gIHJlbmRlcmVyLnNldFBpeGVsUmF0aW8od2luZG93LmRldmljZVBpeGVsUmF0aW8pO1xuICByZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuXG4gIHZhciBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoMzUsIHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0LCAwLjEsIDMwMDApO1xuICBjYW1lcmEucG9zaXRpb24uc2V0KDAsIDAsIDApO1xuXG4gIHZhciBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuICB2YXIgbGlnaHQgPSBuZXcgVEhSRUUuQW1iaWVudExpZ2h0KDB4ZmZmZmZmLCAwLjUpO1xuICBzY2VuZS5hZGQobGlnaHQpO1xuXG4gIHZhciBwb2ludExpZ2h0ID0gbmV3IFRIUkVFLlBvaW50TGlnaHQoMHhmZmZmZmYsIDAuNSk7XG4gIHNjZW5lLmFkZChwb2ludExpZ2h0KTtcblxuICAvLyB2YXIgY29udHJvbHMgPSBuZXcgVEhSRUUuT3JiaXRDb250cm9scyggY2FtZXJhICk7XG4gIC8vIGNvbnRyb2xzLmFkZEV2ZW50TGlzdGVuZXIoICdjaGFuZ2UnLCByZW5kZXJlciApO1xuXG4gIHZhciBwbGFuZSA9IG5ldyBUSFJFRS5HcmlkSGVscGVyKDEwMCwgMTAwKTtcbiAgc2NlbmUuYWRkKHBsYW5lKTtcblxuICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQ3ViZUdlb21ldHJ5KDEyMCwgMTIwLCAxMjApO1xuICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCh7IGNvbG9yOiBcImFxdWFtYXJpbmVcIiwgd2lyZWZyYW1lOiBmYWxzZSB9KTtcbiAgdmFyIGN1YmUgPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xuICBjdWJlLnBvc2l0aW9uLnNldCgwLCAwLCAtMTAwMCk7XG5cbiAgc2NlbmUuYWRkKGN1YmUpO1xuXG4gIGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICBjdWJlLnJvdGF0aW9uLnggKz0gMC4wMDU7XG4gICAgY3ViZS5yb3RhdGlvbi55ICs9IDAuMDA2O1xuICAgIHJlbmRlcmVyLnJlbmRlcihzY2VuZSwgY2FtZXJhKTtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTtcbiAgfVxuXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xuXG4gIGNvbnNvbGUubG9nKHdpbmRvdyk7XG59O1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEBhdXRob3IgcWlhbyAvIGh0dHBzOi8vZ2l0aHViLmNvbS9xaWFvXG4gKiBAYXV0aG9yIG1yZG9vYiAvIGh0dHA6Ly9tcmRvb2IuY29tXG4gKiBAYXV0aG9yIGFsdGVyZWRxIC8gaHR0cDovL2FsdGVyZWRxdWFsaWEuY29tL1xuICogQGF1dGhvciBXZXN0TGFuZ2xleSAvIGh0dHA6Ly9naXRodWIuY29tL1dlc3RMYW5nbGV5XG4gKi9cblxuVEhSRUUuT3JiaXRDb250cm9scyA9IGZ1bmN0aW9uIChvYmplY3QsIGRvbUVsZW1lbnQpIHtcblxuXHR0aGlzLm9iamVjdCA9IG9iamVjdDtcblx0dGhpcy5kb21FbGVtZW50ID0gZG9tRWxlbWVudCAhPT0gdW5kZWZpbmVkID8gZG9tRWxlbWVudCA6IGRvY3VtZW50O1xuXG5cdC8vIEFQSVxuXG5cdHRoaXMuZW5hYmxlZCA9IHRydWU7XG5cblx0dGhpcy5jZW50ZXIgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXG5cdHRoaXMudXNlclpvb20gPSB0cnVlO1xuXHR0aGlzLnVzZXJab29tU3BlZWQgPSAxLjA7XG5cblx0dGhpcy51c2VyUm90YXRlID0gdHJ1ZTtcblx0dGhpcy51c2VyUm90YXRlU3BlZWQgPSAxLjA7XG5cblx0dGhpcy51c2VyUGFuID0gdHJ1ZTtcblx0dGhpcy51c2VyUGFuU3BlZWQgPSAyLjA7XG5cblx0dGhpcy5hdXRvUm90YXRlID0gZmFsc2U7XG5cdHRoaXMuYXV0b1JvdGF0ZVNwZWVkID0gMi4wOyAvLyAzMCBzZWNvbmRzIHBlciByb3VuZCB3aGVuIGZwcyBpcyA2MFxuXG5cdHRoaXMubWluUG9sYXJBbmdsZSA9IDA7IC8vIHJhZGlhbnNcblx0dGhpcy5tYXhQb2xhckFuZ2xlID0gTWF0aC5QSTsgLy8gcmFkaWFuc1xuXG5cdHRoaXMubWluRGlzdGFuY2UgPSAwO1xuXHR0aGlzLm1heERpc3RhbmNlID0gSW5maW5pdHk7XG5cblx0Ly8gNjUgLypBKi8sIDgzIC8qUyovLCA2OCAvKkQqL1xuXHR0aGlzLmtleXMgPSB7IExFRlQ6IDM3LCBVUDogMzgsIFJJR0hUOiAzOSwgQk9UVE9NOiA0MCwgUk9UQVRFOiA2NSwgWk9PTTogODMsIFBBTjogNjggfTtcblxuXHQvLyBpbnRlcm5hbHNcblxuXHR2YXIgc2NvcGUgPSB0aGlzO1xuXG5cdHZhciBFUFMgPSAwLjAwMDAwMTtcblx0dmFyIFBJWEVMU19QRVJfUk9VTkQgPSAxODAwO1xuXG5cdHZhciByb3RhdGVTdGFydCA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cdHZhciByb3RhdGVFbmQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXHR2YXIgcm90YXRlRGVsdGEgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXG5cdHZhciB6b29tU3RhcnQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXHR2YXIgem9vbUVuZCA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cdHZhciB6b29tRGVsdGEgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXG5cdHZhciBwaGlEZWx0YSA9IDA7XG5cdHZhciB0aGV0YURlbHRhID0gMDtcblx0dmFyIHNjYWxlID0gMTtcblxuXHR2YXIgbGFzdFBvc2l0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuXHR2YXIgU1RBVEUgPSB7IE5PTkU6IC0xLCBST1RBVEU6IDAsIFpPT006IDEsIFBBTjogMiB9O1xuXHR2YXIgc3RhdGUgPSBTVEFURS5OT05FO1xuXG5cdC8vIGV2ZW50c1xuXG5cdHZhciBjaGFuZ2VFdmVudCA9IHsgdHlwZTogJ2NoYW5nZScgfTtcblxuXHR0aGlzLnJvdGF0ZUxlZnQgPSBmdW5jdGlvbiAoYW5nbGUpIHtcblxuXHRcdGlmIChhbmdsZSA9PT0gdW5kZWZpbmVkKSB7XG5cblx0XHRcdGFuZ2xlID0gZ2V0QXV0b1JvdGF0aW9uQW5nbGUoKTtcblx0XHR9XG5cblx0XHR0aGV0YURlbHRhIC09IGFuZ2xlO1xuXHR9O1xuXG5cdHRoaXMucm90YXRlUmlnaHQgPSBmdW5jdGlvbiAoYW5nbGUpIHtcblxuXHRcdGlmIChhbmdsZSA9PT0gdW5kZWZpbmVkKSB7XG5cblx0XHRcdGFuZ2xlID0gZ2V0QXV0b1JvdGF0aW9uQW5nbGUoKTtcblx0XHR9XG5cblx0XHR0aGV0YURlbHRhICs9IGFuZ2xlO1xuXHR9O1xuXG5cdHRoaXMucm90YXRlVXAgPSBmdW5jdGlvbiAoYW5nbGUpIHtcblxuXHRcdGlmIChhbmdsZSA9PT0gdW5kZWZpbmVkKSB7XG5cblx0XHRcdGFuZ2xlID0gZ2V0QXV0b1JvdGF0aW9uQW5nbGUoKTtcblx0XHR9XG5cblx0XHRwaGlEZWx0YSAtPSBhbmdsZTtcblx0fTtcblxuXHR0aGlzLnJvdGF0ZURvd24gPSBmdW5jdGlvbiAoYW5nbGUpIHtcblxuXHRcdGlmIChhbmdsZSA9PT0gdW5kZWZpbmVkKSB7XG5cblx0XHRcdGFuZ2xlID0gZ2V0QXV0b1JvdGF0aW9uQW5nbGUoKTtcblx0XHR9XG5cblx0XHRwaGlEZWx0YSArPSBhbmdsZTtcblx0fTtcblxuXHR0aGlzLnpvb21JbiA9IGZ1bmN0aW9uICh6b29tU2NhbGUpIHtcblxuXHRcdGlmICh6b29tU2NhbGUgPT09IHVuZGVmaW5lZCkge1xuXG5cdFx0XHR6b29tU2NhbGUgPSBnZXRab29tU2NhbGUoKTtcblx0XHR9XG5cblx0XHRzY2FsZSAvPSB6b29tU2NhbGU7XG5cdH07XG5cblx0dGhpcy56b29tT3V0ID0gZnVuY3Rpb24gKHpvb21TY2FsZSkge1xuXG5cdFx0aWYgKHpvb21TY2FsZSA9PT0gdW5kZWZpbmVkKSB7XG5cblx0XHRcdHpvb21TY2FsZSA9IGdldFpvb21TY2FsZSgpO1xuXHRcdH1cblxuXHRcdHNjYWxlICo9IHpvb21TY2FsZTtcblx0fTtcblxuXHR0aGlzLnBhbiA9IGZ1bmN0aW9uIChkaXN0YW5jZSkge1xuXG5cdFx0ZGlzdGFuY2UudHJhbnNmb3JtRGlyZWN0aW9uKHRoaXMub2JqZWN0Lm1hdHJpeCk7XG5cdFx0ZGlzdGFuY2UubXVsdGlwbHlTY2FsYXIoc2NvcGUudXNlclBhblNwZWVkKTtcblxuXHRcdHRoaXMub2JqZWN0LnBvc2l0aW9uLmFkZChkaXN0YW5jZSk7XG5cdFx0dGhpcy5jZW50ZXIuYWRkKGRpc3RhbmNlKTtcblx0fTtcblxuXHR0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdHZhciBwb3NpdGlvbiA9IHRoaXMub2JqZWN0LnBvc2l0aW9uO1xuXHRcdHZhciBvZmZzZXQgPSBwb3NpdGlvbi5jbG9uZSgpLnN1Yih0aGlzLmNlbnRlcik7XG5cblx0XHQvLyBhbmdsZSBmcm9tIHotYXhpcyBhcm91bmQgeS1heGlzXG5cblx0XHR2YXIgdGhldGEgPSBNYXRoLmF0YW4yKG9mZnNldC54LCBvZmZzZXQueik7XG5cblx0XHQvLyBhbmdsZSBmcm9tIHktYXhpc1xuXG5cdFx0dmFyIHBoaSA9IE1hdGguYXRhbjIoTWF0aC5zcXJ0KG9mZnNldC54ICogb2Zmc2V0LnggKyBvZmZzZXQueiAqIG9mZnNldC56KSwgb2Zmc2V0LnkpO1xuXG5cdFx0aWYgKHRoaXMuYXV0b1JvdGF0ZSkge1xuXG5cdFx0XHR0aGlzLnJvdGF0ZUxlZnQoZ2V0QXV0b1JvdGF0aW9uQW5nbGUoKSk7XG5cdFx0fVxuXG5cdFx0dGhldGEgKz0gdGhldGFEZWx0YTtcblx0XHRwaGkgKz0gcGhpRGVsdGE7XG5cblx0XHQvLyByZXN0cmljdCBwaGkgdG8gYmUgYmV0d2VlbiBkZXNpcmVkIGxpbWl0c1xuXHRcdHBoaSA9IE1hdGgubWF4KHRoaXMubWluUG9sYXJBbmdsZSwgTWF0aC5taW4odGhpcy5tYXhQb2xhckFuZ2xlLCBwaGkpKTtcblxuXHRcdC8vIHJlc3RyaWN0IHBoaSB0byBiZSBiZXR3ZWUgRVBTIGFuZCBQSS1FUFNcblx0XHRwaGkgPSBNYXRoLm1heChFUFMsIE1hdGgubWluKE1hdGguUEkgLSBFUFMsIHBoaSkpO1xuXG5cdFx0dmFyIHJhZGl1cyA9IG9mZnNldC5sZW5ndGgoKSAqIHNjYWxlO1xuXG5cdFx0Ly8gcmVzdHJpY3QgcmFkaXVzIHRvIGJlIGJldHdlZW4gZGVzaXJlZCBsaW1pdHNcblx0XHRyYWRpdXMgPSBNYXRoLm1heCh0aGlzLm1pbkRpc3RhbmNlLCBNYXRoLm1pbih0aGlzLm1heERpc3RhbmNlLCByYWRpdXMpKTtcblxuXHRcdG9mZnNldC54ID0gcmFkaXVzICogTWF0aC5zaW4ocGhpKSAqIE1hdGguc2luKHRoZXRhKTtcblx0XHRvZmZzZXQueSA9IHJhZGl1cyAqIE1hdGguY29zKHBoaSk7XG5cdFx0b2Zmc2V0LnogPSByYWRpdXMgKiBNYXRoLnNpbihwaGkpICogTWF0aC5jb3ModGhldGEpO1xuXG5cdFx0cG9zaXRpb24uY29weSh0aGlzLmNlbnRlcikuYWRkKG9mZnNldCk7XG5cblx0XHR0aGlzLm9iamVjdC5sb29rQXQodGhpcy5jZW50ZXIpO1xuXG5cdFx0dGhldGFEZWx0YSA9IDA7XG5cdFx0cGhpRGVsdGEgPSAwO1xuXHRcdHNjYWxlID0gMTtcblxuXHRcdGlmIChsYXN0UG9zaXRpb24uZGlzdGFuY2VUbyh0aGlzLm9iamVjdC5wb3NpdGlvbikgPiAwKSB7XG5cblx0XHRcdHRoaXMuZGlzcGF0Y2hFdmVudChjaGFuZ2VFdmVudCk7XG5cblx0XHRcdGxhc3RQb3NpdGlvbi5jb3B5KHRoaXMub2JqZWN0LnBvc2l0aW9uKTtcblx0XHR9XG5cdH07XG5cblx0ZnVuY3Rpb24gZ2V0QXV0b1JvdGF0aW9uQW5nbGUoKSB7XG5cblx0XHRyZXR1cm4gMiAqIE1hdGguUEkgLyA2MCAvIDYwICogc2NvcGUuYXV0b1JvdGF0ZVNwZWVkO1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0Wm9vbVNjYWxlKCkge1xuXG5cdFx0cmV0dXJuIE1hdGgucG93KDAuOTUsIHNjb3BlLnVzZXJab29tU3BlZWQpO1xuXHR9XG5cblx0ZnVuY3Rpb24gb25Nb3VzZURvd24oZXZlbnQpIHtcblxuXHRcdGlmIChzY29wZS5lbmFibGVkID09PSBmYWxzZSkgcmV0dXJuO1xuXHRcdGlmIChzY29wZS51c2VyUm90YXRlID09PSBmYWxzZSkgcmV0dXJuO1xuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdGlmIChzdGF0ZSA9PT0gU1RBVEUuTk9ORSkge1xuXHRcdFx0aWYgKGV2ZW50LmJ1dHRvbiA9PT0gMCkgc3RhdGUgPSBTVEFURS5ST1RBVEU7XG5cdFx0XHRpZiAoZXZlbnQuYnV0dG9uID09PSAxKSBzdGF0ZSA9IFNUQVRFLlpPT007XG5cdFx0XHRpZiAoZXZlbnQuYnV0dG9uID09PSAyKSBzdGF0ZSA9IFNUQVRFLlBBTjtcblx0XHR9XG5cblx0XHRpZiAoc3RhdGUgPT09IFNUQVRFLlJPVEFURSkge1xuXG5cdFx0XHQvL3N0YXRlID0gU1RBVEUuUk9UQVRFO1xuXG5cdFx0XHRyb3RhdGVTdGFydC5zZXQoZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSk7XG5cdFx0fSBlbHNlIGlmIChzdGF0ZSA9PT0gU1RBVEUuWk9PTSkge1xuXG5cdFx0XHQvL3N0YXRlID0gU1RBVEUuWk9PTTtcblxuXHRcdFx0em9vbVN0YXJ0LnNldChldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcblx0XHR9IGVsc2UgaWYgKHN0YXRlID09PSBTVEFURS5QQU4pIHtcblxuXHRcdFx0Ly9zdGF0ZSA9IFNUQVRFLlBBTjtcblxuXHRcdH1cblxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG9uTW91c2VNb3ZlLCBmYWxzZSk7XG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG9uTW91c2VVcCwgZmFsc2UpO1xuXHR9XG5cblx0ZnVuY3Rpb24gb25Nb3VzZU1vdmUoZXZlbnQpIHtcblxuXHRcdGlmIChzY29wZS5lbmFibGVkID09PSBmYWxzZSkgcmV0dXJuO1xuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdGlmIChzdGF0ZSA9PT0gU1RBVEUuUk9UQVRFKSB7XG5cblx0XHRcdHJvdGF0ZUVuZC5zZXQoZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSk7XG5cdFx0XHRyb3RhdGVEZWx0YS5zdWJWZWN0b3JzKHJvdGF0ZUVuZCwgcm90YXRlU3RhcnQpO1xuXG5cdFx0XHRzY29wZS5yb3RhdGVMZWZ0KDIgKiBNYXRoLlBJICogcm90YXRlRGVsdGEueCAvIFBJWEVMU19QRVJfUk9VTkQgKiBzY29wZS51c2VyUm90YXRlU3BlZWQpO1xuXHRcdFx0c2NvcGUucm90YXRlVXAoMiAqIE1hdGguUEkgKiByb3RhdGVEZWx0YS55IC8gUElYRUxTX1BFUl9ST1VORCAqIHNjb3BlLnVzZXJSb3RhdGVTcGVlZCk7XG5cblx0XHRcdHJvdGF0ZVN0YXJ0LmNvcHkocm90YXRlRW5kKTtcblx0XHR9IGVsc2UgaWYgKHN0YXRlID09PSBTVEFURS5aT09NKSB7XG5cblx0XHRcdHpvb21FbmQuc2V0KGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xuXHRcdFx0em9vbURlbHRhLnN1YlZlY3RvcnMoem9vbUVuZCwgem9vbVN0YXJ0KTtcblxuXHRcdFx0aWYgKHpvb21EZWx0YS55ID4gMCkge1xuXG5cdFx0XHRcdHNjb3BlLnpvb21JbigpO1xuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRzY29wZS56b29tT3V0KCk7XG5cdFx0XHR9XG5cblx0XHRcdHpvb21TdGFydC5jb3B5KHpvb21FbmQpO1xuXHRcdH0gZWxzZSBpZiAoc3RhdGUgPT09IFNUQVRFLlBBTikge1xuXG5cdFx0XHR2YXIgbW92ZW1lbnRYID0gZXZlbnQubW92ZW1lbnRYIHx8IGV2ZW50Lm1vek1vdmVtZW50WCB8fCBldmVudC53ZWJraXRNb3ZlbWVudFggfHwgMDtcblx0XHRcdHZhciBtb3ZlbWVudFkgPSBldmVudC5tb3ZlbWVudFkgfHwgZXZlbnQubW96TW92ZW1lbnRZIHx8IGV2ZW50LndlYmtpdE1vdmVtZW50WSB8fCAwO1xuXG5cdFx0XHRzY29wZS5wYW4obmV3IFRIUkVFLlZlY3RvcjMoLW1vdmVtZW50WCwgbW92ZW1lbnRZLCAwKSk7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gb25Nb3VzZVVwKGV2ZW50KSB7XG5cblx0XHRpZiAoc2NvcGUuZW5hYmxlZCA9PT0gZmFsc2UpIHJldHVybjtcblx0XHRpZiAoc2NvcGUudXNlclJvdGF0ZSA9PT0gZmFsc2UpIHJldHVybjtcblxuXHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG9uTW91c2VNb3ZlLCBmYWxzZSk7XG5cdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG9uTW91c2VVcCwgZmFsc2UpO1xuXG5cdFx0c3RhdGUgPSBTVEFURS5OT05FO1xuXHR9XG5cblx0ZnVuY3Rpb24gb25Nb3VzZVdoZWVsKGV2ZW50KSB7XG5cblx0XHRpZiAoc2NvcGUuZW5hYmxlZCA9PT0gZmFsc2UpIHJldHVybjtcblx0XHRpZiAoc2NvcGUudXNlclpvb20gPT09IGZhbHNlKSByZXR1cm47XG5cblx0XHR2YXIgZGVsdGEgPSAwO1xuXG5cdFx0aWYgKGV2ZW50LndoZWVsRGVsdGEpIHtcblx0XHRcdC8vIFdlYktpdCAvIE9wZXJhIC8gRXhwbG9yZXIgOVxuXG5cdFx0XHRkZWx0YSA9IGV2ZW50LndoZWVsRGVsdGE7XG5cdFx0fSBlbHNlIGlmIChldmVudC5kZXRhaWwpIHtcblx0XHRcdC8vIEZpcmVmb3hcblxuXHRcdFx0ZGVsdGEgPSAtZXZlbnQuZGV0YWlsO1xuXHRcdH1cblxuXHRcdGlmIChkZWx0YSA+IDApIHtcblxuXHRcdFx0c2NvcGUuem9vbU91dCgpO1xuXHRcdH0gZWxzZSB7XG5cblx0XHRcdHNjb3BlLnpvb21JbigpO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIG9uS2V5RG93bihldmVudCkge1xuXG5cdFx0aWYgKHNjb3BlLmVuYWJsZWQgPT09IGZhbHNlKSByZXR1cm47XG5cdFx0aWYgKHNjb3BlLnVzZXJQYW4gPT09IGZhbHNlKSByZXR1cm47XG5cblx0XHRzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcblxuXHRcdFx0LypjYXNlIHNjb3BlLmtleXMuVVA6XG4gICBcdHNjb3BlLnBhbiggbmV3IFRIUkVFLlZlY3RvcjMoIDAsIDEsIDAgKSApO1xuICAgXHRicmVhaztcbiAgIGNhc2Ugc2NvcGUua2V5cy5CT1RUT006XG4gICBcdHNjb3BlLnBhbiggbmV3IFRIUkVFLlZlY3RvcjMoIDAsIC0gMSwgMCApICk7XG4gICBcdGJyZWFrO1xuICAgY2FzZSBzY29wZS5rZXlzLkxFRlQ6XG4gICBcdHNjb3BlLnBhbiggbmV3IFRIUkVFLlZlY3RvcjMoIC0gMSwgMCwgMCApICk7XG4gICBcdGJyZWFrO1xuICAgY2FzZSBzY29wZS5rZXlzLlJJR0hUOlxuICAgXHRzY29wZS5wYW4oIG5ldyBUSFJFRS5WZWN0b3IzKCAxLCAwLCAwICkgKTtcbiAgIFx0YnJlYWs7XG4gICAqL1xuXHRcdFx0Y2FzZSBzY29wZS5rZXlzLlJPVEFURTpcblx0XHRcdFx0c3RhdGUgPSBTVEFURS5ST1RBVEU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBzY29wZS5rZXlzLlpPT006XG5cdFx0XHRcdHN0YXRlID0gU1RBVEUuWk9PTTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIHNjb3BlLmtleXMuUEFOOlxuXHRcdFx0XHRzdGF0ZSA9IFNUQVRFLlBBTjtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBvbktleVVwKGV2ZW50KSB7XG5cblx0XHRzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcblxuXHRcdFx0Y2FzZSBzY29wZS5rZXlzLlJPVEFURTpcblx0XHRcdGNhc2Ugc2NvcGUua2V5cy5aT09NOlxuXHRcdFx0Y2FzZSBzY29wZS5rZXlzLlBBTjpcblx0XHRcdFx0c3RhdGUgPSBTVEFURS5OT05FO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHR9LCBmYWxzZSk7XG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbk1vdXNlRG93biwgZmFsc2UpO1xuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V3aGVlbCcsIG9uTW91c2VXaGVlbCwgZmFsc2UpO1xuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NTW91c2VTY3JvbGwnLCBvbk1vdXNlV2hlZWwsIGZhbHNlKTsgLy8gZmlyZWZveFxuXHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5RG93biwgZmFsc2UpO1xuXHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBvbktleVVwLCBmYWxzZSk7XG59O1xuXG5USFJFRS5PcmJpdENvbnRyb2xzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVEhSRUUuRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZSk7Il0sImZpbGUiOiJhcHAuanMifQ==
