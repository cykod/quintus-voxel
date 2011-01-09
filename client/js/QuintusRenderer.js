

var QuintusRendererBuilder = function(q) {

  var KEY_CODES = { 37:'left', 39:'right', 38:'up', 40:'down', 32:'space' };
  var currentScene = null;
  var dimensions = {}

  q.initialize  = function(dom) {

    q.renderer = new THREE.WebGLRenderer( false );

    dimensions = { w: $(dom).width(), h: $(dom).height() };
    q.renderer.setSize(dimensions.w,dimensions.h);

    dom[0].appendChild(q.renderer.domElement);

    q.stats = new Stats();
    q.stats.domElement.style.position = 'absolute';
    q.stats.domElement.style.top = '0px';
    q.stats.domElement.style.zIndex = 100;
    dom[0].appendChild(q.stats.domElement);

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
    if(currentScene && Quintus.active == 'arena') { 
      q.updateCamera();
      currentScene.stepCore(60/1000);
      q.renderer.render(currentScene.scene,q.camera);
      q.stats.update();
    }
  }

}

var QuintusRenderer = {};
QuintusRendererBuilder(QuintusRenderer);


var QuintusScene = function() {
  var qscene = this;
  this.objects = [];
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
    if(obj instanceof Voxel) {
      this.scene.addObject(obj.o);
    } else {
      obj.each(function(o) { qscene.scene.addObject(o.o) });
    }
  }




  this.collide = function(o1) {
    for(var i=0,len = this.objects.length;i<len;i++) {
      var o2 = this.objects[i];
      if(o1 != o2) {
        var col = o1.collide(o2);
        if(col) return col;
      }
    }
    return false;
  }
}

var QMaterials = {};
(function(m) {
   var materials = {};

   materials['blue'] = new THREE.MeshBasicMaterial( { color: 0x0000ff, opacity: 0.5 } );
   materials['grass'] = new THREE.MeshBasicMaterial( { map: ImageUtils.loadTexture( 'img/grass_subtle.jpg')} );

   materials['red'] = new THREE.MeshLambertMaterial({ color: 0xFF0000, shading: THREE.SmoothShading });
   materials['concrete']  = new THREE.MeshLambertMaterial( { map: ImageUtils.loadTexture( 'img/concrete.jpg'), shading: THREE.SmoothShading } );
 
   materials['default'] = materials['red'];

   m.lookup = function(name) {
     return materials[name];
   }
  
})(QMaterials);


var BASE_DIM = 16;
var VoxelCube = new Cube(BASE_DIM,BASE_DIM,BASE_DIM);
var VoxelGravity = new THREE.Vector3(0,-98,0);

var Voxel = function(dim,material) {
  if(material instanceof String) {
    material = QMaterials.lookup(material);
  }
  if(!material) material = QMaterials.lookup('default');

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
  if(!this.group) {
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
}

Voxel.prototype.pos = function(x,y,z) {
  this.position.set(x,y,z);
  return this;
}

Voxel.prototype.addTo = function(qscene) {
  qscene.add(this);
  return this;
}

Voxel.prototype.addToGroup = function(group) {
  this.group = group;
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
  var collide = !((o1.position.y+o1.h/2-t<o2.position.y-o2.h/2) || 
           (o1.position.y-o1.h/2+t> o2.position.y+o2.h/2-t) || 
           (o1.position.x+o1.w/2-t<o2.position.x-o2.w/2+t) || 
           (o1.position.x-o1.w/2+t>o2.position.x+o2.w/2-t) || 
           (o1.position.z+o1.d/2-t<o2.position.z-o2.d/2+t) || 
           (o1.position.z-o1.d/2+t>o2.position.z+o2.d/2-t));

  return collide;
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


VoxelGroup  = function(dim,voxelData) {
  if(false === (this instanceof VoxelGroup)) {
    return new VoxelGroup(dim,voxelData);
  }

  this.objects = []


  for(var i=0,len=voxelData.length;i<len;i++) {
    var v = voxelData[i];

    this.objects.push(new Voxel(dim,v.material).pos(v.x*dim*BASE_DIM,
                                                    v.y*dim*BASE_DIM,
                                                    v.z*dim*BASE_DIM).addToGroup(this));
  }

  this.velocity = new THREE.Vector3(0,0,0);
  this.position = new THREE.Vector3(0,0,0);

  this.scale = new THREE.Vector3(dim,dim,dim);
  return this;
}

VoxelGroup.prototype.addTo = function(qscene) {
  qscene.add(this);
  return this;
}


VoxelGroup.prototype.step = function(dt) {
  this.velocity.addSelf(new THREE.Vector3(VoxelGravity.x * dt,
     VoxelGravity.y * dt,
     VoxelGravity.z * dt));
  this.pos(this.position.clone().addSelf(new THREE.Vector3(this.velocity.x * dt,
                                         this.velocity.y * dt,
                                         this.velocity.z * dt)));

  if(this.position.y - (this.scale.y*BASE_DIM/2) < 0)  {
    var newPos = this.position.clone();
    newPos.y = this.scale.y*BASE_DIM/2;
    this.pos(newPos);
    this.velocity.set(0,0,0);
  }
}



VoxelGroup.prototype.pos = function(x,y,z) {
  if(x instanceof THREE.Vector3) {
    y = x.y;
    z = x.z;
    x = x.x;
  }
  var diff = new THREE.Vector3(x,y,z).subSelf(this.position);

  return this.move(diff);

 }

VoxelGroup.prototype.move = function(diff) {
  this.each(function(o) {
    o.position.addSelf(diff);
  });

  this.position.addSelf(diff);
  return this;

}

VoxelGroup.prototype.each = function(f) {
  for(var i=0,len=this.objects.length;i<len;i++) {
    f(this.objects[i]);
  }
}


VoxelGroup.prototype.detect = function(matcher) {
    for(var i=0,len=this.objects.length;i<len;i++) {
      var obj = this.objects[i];
      var result = matcher(obj);
      if(result) return result;
    }
    return false;
  }

VoxelGroup.prototype.collide = function(obj,t) {
  if (!t) t=0;
  // Return the blocks that collided
  var blocks = this.detect(function(o2) { 
    var col = obj.eachBlock(o2,Voxel.prototype.blockCollide); 
    return col ? [ o2, col ] : null;
  });
  return blocks;
}

VoxelGroup.prototype.eachBlock = function(block,collideMethod) {
  return this.detect(function(o2) { 
      return collideMethod(block,o2) ? o2 : null;
    });
}


VoxelGroup.prototype.backOff = function(objects) {
  this.velocity.set(0,0,0);

  var myobj = objects[0];
  var otherobj = objects[1];

  var diff =myobj.position.clone().subSelf(otherobj.position);

  diff.x = Math.abs(diff.x);
  diff.y = Math.abs(diff.y);
  diff.z = Math.abs(diff.z);

  var mypos = myobj.position.clone();
  var otherpos = otherobj.position;

  if(diff.y >= diff.x && diff.y >= diff.z) {
     if(mypos.y < otherpos.y) {
       mypos.y = otherpos.y - otherobj.h/2 - myobj.h/2 - 0.01;
     } else {
       mypos.y = otherpos.y + otherobj.h/2 + myobj.h/2 + 0.01;
     }
   } else if(diff.x >= diff.z) {
    if(mypos.x < otherpos.x) {
      mypos.x = otherpos.x - otherobj.w/2 - myobj.w/2 - 0.01;
    } else {
      mypos.x = otherpos.x + otherobj.w/2 + myobj.w/2 + 0.01;
    }
   } else {
     if(mypos.z < otherpos.z) {
       mypos.z = otherpos.z - otherobj.d/2 - myobj.d/2 - 0.01;
     } else {
       mypos.z = otherpos.z + otherobj.d/2 + myobj.d/2 + 0.01;
     }
   }

   var enddiff = mypos.subSelf(myobj.position);
   this.move(enddiff);
}
