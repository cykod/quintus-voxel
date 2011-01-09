var QuintusBuilder = {};

(function(q) {


  var KEY_CODES = { 37:'left', 39:'right', 38:'up', 40:'down', 32:'space' };

  var container, stats;
  var camera, scene, renderer;
  var projector, plane, cube;
  var mouse2D, mouse3D, ray,
  rollOveredFace, isShiftDown = false,
  isCtrlDown = false;
  var dimensions = {};
  var offset = {};
  var objects = [];
  var scene;

  q.initialize = function(dom) {
    q.renderer = new THREE.CanvasRenderer( false );

    dimensions = { w: $(dom).width(), h: $(dom).height() };

    q.renderer.setSize(dimensions.w,dimensions.h);

    offset = $(dom).offset();
    
    q.keys = {};

    dom[0].appendChild(q.renderer.domElement);

    scene = q.scene = new THREE.Scene();

    q.setupGrid();
    q.setupCamera();
    q.setupLights();
    q.setupMouse();
    q.setupKeyboard();

    setInterval(q.loop, 1000 / 60);
  }

  q.setupKeyboard = function() {
    $(window).keydown(function(event) {
      var key = KEY_CODES[event.keyCode];
      if(KEY_CODES[event.keyCode]) q.keys[KEY_CODES[event.keyCode]] = true;
    });

    $(window).keyup(function(event) {
      if(KEY_CODES[event.keyCode]) q.keys[KEY_CODES[event.keyCode]] = false;
    });
  }




  q.setupGrid = function() {
    // Grid

    var geometry = new THREE.Geometry();
    geometry.vertices.push( new THREE.Vertex( new THREE.Vector3( - 250, 0, 0 ) ) );
    geometry.vertices.push( new THREE.Vertex( new THREE.Vector3( 250, 0, 0 ) ) );

    var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } );

    for ( var i = 0; i <= 10 ; i ++ ) {

      var line = new THREE.Line( geometry, material );
      line.position.z = ( i * 50 ) - 250;
      this.scene.addObject( line );

      var line = new THREE.Line( geometry, material );
      line.position.x = ( i * 50 ) - 250;
      line.rotation.y = 90 * Math.PI / 180;
      this.scene.addObject( line );

    }
  }



 q.setupCamera = function() {
    q.camera = new THREE.Camera( 60, dimensions.w / dimensions.h, 1, 10000 );

    q.cameraAngle = 0;
    q.camera.position.y = 512;
    q.updateCamera();

  //  q.camera.projectionMatrix = THREE.Matrix4.makeOrtho( dimensions.w / - 2, dimensions.w / 2, dimensions.h / 2, dimensions.h / - 2, -2500, 2500 );
    
				// Lights
 
				this.scene.addLight( new THREE.AmbientLight( 0x202020 ) );
 
				var directionalLight = new THREE.DirectionalLight( Math.random() * 0xffffff );
				directionalLight.position.x = Math.random() - 0.5;
				directionalLight.position.y = Math.random() - 0.5;
				directionalLight.position.z = Math.random() - 0.5;
				directionalLight.position.normalize();
				this.scene.addLight( directionalLight );
 
				pointLight = new THREE.PointLight( 0xffffff, 1 );
				this.scene.addLight( pointLight );
 


  }

  q.setupLights = function() {
 
    projector = new THREE.Projector();

    plane = new THREE.Mesh( new Plane( 500, 500, 10, 10 ), new THREE.MeshFaceMaterial() );
    plane.rotation.x = - 90 * Math.PI / 180;
    this.scene.addObject( plane );

    mouse2D = new THREE.Vector3( 0, 10000, 0.5 );
    ray = new THREE.Ray( this.camera.position, null );

    // Lights

    var ambientLight = new THREE.AmbientLight( 0x606060 );
    this.scene.addLight( ambientLight );

    var directionalLight = new THREE.DirectionalLight( 0xffffff );
    directionalLight.position.x = Math.random() - 0.5;
    directionalLight.position.y = Math.random() - 0.5;
    directionalLight.position.z = Math.random() - 0.5;
    directionalLight.position.normalize();
    this.scene.addLight( directionalLight );

    var directionalLight = new THREE.DirectionalLight( 0x808080 );
    directionalLight.position.x = Math.random() - 0.5;
    directionalLight.position.y = Math.random() - 0.5;
    directionalLight.position.z = Math.random() - 0.5;
    directionalLight.position.normalize();
    this.scene.addLight( directionalLight );


  }

  q.setupMouse = function() {

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'keydown', onDocumentKeyDown, false );
    document.addEventListener( 'keyup', onDocumentKeyUp, false );

  }

  function onDocumentMouseMove( event ) {

    event.preventDefault();

    mouse2D.x = ( (event.clientX - offset.left) / dimensions.w) * 2 - 1;
    mouse2D.y = -( ( event.clientY - offset.top) / dimensions.h) * 2 + 1;

  }


  function addVoxel(x,y,z) {
    var voxel = new THREE.Mesh( new Cube( 50, 50, 50 ), [ new THREE.MeshLambertMaterial( { color: 0x00ff80, opacity: 1, shading: THREE.FlatShading } ), new THREE.MeshFaceMaterial() ] );
    voxel.position.x = x * 50 + 25;
    voxel.position.y = y * 50 + 25;
    voxel.position.z = z * 50 + 25;
    voxel.overdraw = true;

    obj = { object: voxel, x:x, y:y, z:z }
    objects.push(obj);

    scene.addObject( voxel );
  }

  function removeVoxel(object) {
    var elem = detect(function() { return this.object == object; });
    if(elem) {
      var idx = objects.indexOf(elem);
      scene.removeObject(elem.object);
      if(idx!=-1) objects.splice(idx,1);
    }
  }

  q.getObjects = function() {
    return objects;
  }


  function detect(matcher) {
    for(var i=0,len=objects.length;i<len;i++) {
      var obj = objects[i];
      if(matcher.call(obj)) return obj;
    }
    return false;
  }

  function onDocumentMouseDown( event ) {

    event.preventDefault();

    var intersects = ray.intersectScene( scene );

    if ( intersects.length > 0 ) {

      if ( isShiftDown ) {

        if ( intersects[ 0 ].object != plane ) {
          removeVoxel( intersects[ 0 ].object );
        }

      } else {

          var position = new THREE.Vector3().add( intersects[ 0 ].point, intersects[ 0 ].object.rotationMatrix.multiplyVector3( intersects[ 0 ].face.normal.clone() ) );
          addVoxel(Math.floor(position.x / 50),
                   Math.floor(position.y / 50),
                   Math.floor(position.z / 50));

        }

      }
    }

    function onDocumentKeyDown( event ) {

      switch( event.keyCode ) {

        case 16: isShiftDown = true; break;
        case 17: isCtrlDown = true; break;

      }

    }

    function onDocumentKeyUp( event ) {

      switch( event.keyCode ) {

        case 16: isShiftDown = false; break;
        case 17: isCtrlDown = false; break;

      }
    }




  q.updateCamera = function() {
    if(q.keys['left']) q.cameraAngle -= 5 * Math.PI / 360;
    if(q.keys['right']) q.cameraAngle += 5 * Math.PI / 360;
    if(q.keys['up']) q.camera.position.y += 10;
    if(q.keys['down']) q.camera.position.y -= 10;
    q.camera.position.x = Math.sin(q.cameraAngle) * 512;
    q.camera.position.z = Math.cos(q.cameraAngle) * 512;

    /*q.camera.target.position.x = 256;
    q.camera.target.position.y = 128;
    q.camera.target.position.z = 256;
    */
    q.camera.updateMatrix();
  }



  q.loop = function() {
    mouse3D = projector.unprojectVector( mouse2D.clone(), q.camera );
    ray.direction = mouse3D.subSelf( q.camera.position ).normalize();

    var intersects = ray.intersectScene( scene );

    // console.log( intersects );

    if ( intersects.length > 0 ) {

      if ( intersects[ 0 ].face != rollOveredFace ) {

        if ( rollOveredFace ) rollOveredFace.materials = [];
        rollOveredFace = intersects[ 0 ].face;
        rollOveredFace.materials = [ new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5 } ) ];
      }

    } else if ( rollOveredFace ) {
      rollOveredFace.materials = [];
      rollOveredFace = null;

    }

    q.updateCamera();
    q.renderer.render(q.scene,q.camera);
  }

})(QuintusBuilder);

