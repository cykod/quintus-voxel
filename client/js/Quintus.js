

var QuintusRenderer = {};

(function(q) {

  var KEY_CODES = { 37:'left', 39:'right', 38:'up', 40:'down', 32:'space' };
  var currentScene = null;
  var dimensions = {}

  q.initialize  = function(width,height) {

    q.renderer = new THREE.WebGLRenderer2( false );
    q.renderer.setSize(width, height);
    dimensions.w = width;
    dimensions.h = height;

    document.body.appendChild( q.renderer.domElement );

    q.stats = new Stats();
    q.stats.domElement.style.position = 'absolute';
    q.stats.domElement.style.top = '0px';
    q.stats.domElement.style.zIndex = 100;
    document.body.appendChild( q.stats.domElement );

    q.keys = {};
    q.setupCamera();

    setInterval(q.loop, 1000 / 60);

    $(window).keydown(function(event) {
      var key = KEY_CODES[event.keyCode];
      if(KEY_CODES[event.keyCode]) q.keys[KEY_CODES[event.keyCode]] = true;
      if(currentScene && currentScene.keyPress) currentScene.keyPress(key);
    });

    $(window).keyup(function(event) {
      if(KEY_CODES[event.keyCode]) q.keys[KEY_CODES[event.keyCode]] = false;
    });

  }

  q.setupCamera = function() {
    q.camera = new THREE.Camera( 60, dimensions.w / dimensions.h, 1, 10000 );

    q.cameraAngle = 0;
    q.camera.position.y = 512;
    q.updateCamera();

  //  q.camera.projectionMatrix = THREE.Matrix4.makeOrtho( dimensions.w / - 2, dimensions.w / 2, dimensions.h / 2, dimensions.h / - 2, -2500, 2500 );
    
  }

  q.updateCamera = function() {
    if(q.keys['left']) q.cameraAngle -= 5 * Math.PI / 360;
    if(q.keys['right']) q.cameraAngle += 5 * Math.PI / 360;
    if(q.keys['up']) q.camera.position.y += 10;
    if(q.keys['down']) q.camera.position.y -= 10;
    q.camera.position.x = Math.sin(q.cameraAngle) * 1024;
    q.camera.position.z = Math.cos(q.cameraAngle) * 1024;

    /*q.camera.target.position.x = 256;
    q.camera.target.position.y = 128;
    q.camera.target.position.z = 256;
    */
    q.camera.updateMatrix();
  }

  q.setScene = function(scene) {
    scene.init();
    currentScene = scene;
  }

  q.loop = function() {
    q.updateCamera();
    if(currentScene) { 
      currentScene.stepCore(60/1000);
      q.renderer.render(currentScene.scene,q.camera);
    }
    q.stats.update();
  }

})(QuintusRenderer);



var QuintusBuilder = {};

(function(q) {


  var KEY_CODES = { 37:'left', 39:'right', 38:'up', 40:'down', 32:'space' };

  var container, stats;
  var camera, scene, renderer;
  var projector, plane, cube;
  var mouse2D, mouse3D, ray,
  rollOveredFace, isShiftDown = false,
  theta = 45, isCtrlDown = false;
  var radius = 1600, theta = 45, onMouseDownTheta = 45, phi = 60, onMouseDownPhi = 60;
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

  function onDocumentMouseDown( event ) {

    event.preventDefault();

    var intersects = ray.intersectScene( scene );

    if ( intersects.length > 0 ) {

      if ( isCtrlDown ) {

        if ( intersects[ 0 ].object != plane ) {

          scene.removeObject( intersects[ 0 ].object );

        }

        } else {

          var position = new THREE.Vector3().add( intersects[ 0 ].point, intersects[ 0 ].object.rotationMatrix.multiplyVector3( intersects[ 0 ].face.normal.clone() ) );

          var voxel = new THREE.Mesh( new Cube( 50, 50, 50 ), [ new THREE.MeshLambertMaterial( { color: 0x00ff80, opacity: 1, shading: THREE.FlatShading } ), new THREE.MeshFaceMaterial() ] );
          voxel.position.x = Math.floor( position.x / 50 ) * 50 + 25;
          voxel.position.y = Math.floor( position.y / 50 ) * 50 + 25;
          voxel.position.z = Math.floor( position.z / 50 ) * 50 + 25;
          voxel.overdraw = true;
          scene.addObject( voxel );

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

    if ( isShiftDown ) {

      theta += mouse2D.x * 3;

    }

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



var QuintusScene = function() {
  this.objects = [];
  this.scene = new THREE.Scene();
  this.stepCore = function(dt) {
    if(this.step) this.step(dt);
    for(var i=0,len = this.objects.length;i<len;i++) {
      var obj = this.objects[i];
      obj.step(dt);

      var col = this.collide(obj);
      if(col) {
        obj.backOff(col);
      }
    }

  }

  this.add= function(obj) {
    this.objects[this.objects.length] = obj;
    this.scene.addObject(obj.o);
  }

  this.collide = function(o1) {
    for(var i=0,len = this.objects.length;i<len;i++) {
      var o2 = this.objects[i];
      if(o1 != o2) {
        if(o1 != o2 && o1.collide(o2)) return o2;
      }
    }
    return false;
  }
}

var BASE_DIM = 16;
var VoxelCube = new Cube(BASE_DIM,BASE_DIM,BASE_DIM);
var VoxelGravity = new THREE.Vector3(0,-98,0);

var Voxel = function(dim,material) {
  if(false === (this instanceof Voxel)) {
    return new Voxel(dim,material);
  }


  this.o = new THREE.Mesh(VoxelCube,material);
  this.o.scale = this.scale = new THREE.Vector3(dim,dim,dim);
  this.w = this.h = this.d = BASE_DIM * dim;
  this.velocity = new THREE.Vector3();
  this.position = this.o.position;
  return this;
}

Voxel.prototype.step = function(dt) {
  this.velocity.addSelf(new THREE.Vector3(VoxelGravity.x * dt,
                                          VoxelGravity.y * dt,
                                          VoxelGravity.z * dt));
  this.position.addSelf(new THREE.Vector3(this.velocity.x * dt,
                                           this.velocity.y * dt,
                                          this.velocity.z * dt));

  if(this.position.y - (this.scale.y*BASE_DIM/2) < 0)  {
    this.position.y = this.scale.y*BASE_DIM/2;
    this.velocity.set(0,0,0);
  }
}

Voxel.prototype.pos = function(x,y,z) {
  this.position.set(x,y,z);
  return this;
}

Voxel.prototype.addTo = function(qscene) {
  qscene.add(this);
  return this;
}


Voxel.prototype.collide = function(obj,t) {
  if (!t) t=0;
  return obj.eachBlock(this,Voxel.prototype.blockCollide);
}

Voxel.prototype.eachBlock = function(block,collideMethod) {
  return collideMethod(block,this);
}

Voxel.prototype.blockCollide = function(o1,o2) {
  t=0;
  return !((o1.position.y+o1.h/2-t<o2.position.y-o2.h/2) || 
           (o1.position.y-o1.h/2+t> o2.position.y+o2.h/2-t) || 
           (o1.position.x+o1.w/2-t<o2.position.x-o2.w/2+t) || 
           (o1.position.x-o1.w/2+t>o2.position.x+o2.w/2-t) || 
           (o1.position.z+o1.d/2-t<o2.position.z-o2.d/2+t) || 
           (o1.position.z-o1.d/2+t>o2.position.z+o2.d/2-t));

}


Voxel.prototype.backOff = function(o2) {
  this.velocity.set(0,0,0);
  
  var diff =this.position.clone().subSelf(o2.position);

  diff.x = Math.abs(diff.x);
  diff.y = Math.abs(diff.y);
  diff.z = Math.abs(diff.z);

  var mypos = this.position;
  var otherpos = o2.position;

  if(diff.y >= diff.x && diff.y >= diff.z) {
     if(mypos.y < otherpos.y) {
       mypos.y = otherpos.y - o2.h/2 - this.h/2 - 0.01;
     } else {
       mypos.y = otherpos.y + o2.h/2 + this.h/2 + 0.01;
     }
   } else if(diff.x >= diff.z) {
    if(mypos.x < otherpos.x) {
      mypos.x = otherpos.x - o2.w/2 - this.w/2 - 0.01;
    } else {
      mypos.x = otherpos.x + o2.w/2 + this.w/2 + 0.01;
    }
   } else {
     if(mypos.z < otherpos.z) {
       mypos.z = otherpos.z - o2.d/2 - this.d/2 - 0.01;
     } else {
       mypos.z = otherpos.z + o2.d/2 + this.d/2 + 0.01;
     }
   }

}
