
    var Scene1= new QuintusScene();


    Scene1.init = function() {
      this.scene = new THREE.Scene();
      this.particles = [];

    
      //Voxel(4,QMaterials.lookup('blue')).pos(0, 300, 20).addTo(this);
      //   Voxel(1,this.material2).pos(500, 400, 0).addTo(this);
      //   Voxel(1,this.material2).pos(500, 400, 256).addTo(this);
      //Voxel(4,QMaterials.lookup('red')).pos(0, 600, 0).addTo(this);
      //

      //VoxelGroup(10,[ { x:0, y:0, z:0 }, { x:1, y:0, z:0 }, { x:0, y:0, z:1 } ]).pos(0,200,0).addTo(this);

      this.plane = new THREE.Mesh(new Plane(1024,1024,32,32),QMaterials.lookup('grass'));
      this.plane.rotation.x =  -Math.PI/2;
      //this.plane.rotation.z = -Math.PI/2;
      this.scene.addObject(this.plane);

       var ambientLight = new THREE.AmbientLight( 0x404040 );
       this.scene.addLight( ambientLight );

       var directionalLight = new THREE.DirectionalLight( 0xffffff );
       directionalLight.position.x = 1;
       directionalLight.position.y = 1;
       directionalLight.position.z = 0.75;
       directionalLight.position.normalize();
       this.scene.addLight( directionalLight );

       var directionalLight = new THREE.DirectionalLight( 0x808080 );
       directionalLight.position.x = - 1;
       directionalLight.position.y = 1;
       directionalLight.position.z = - 0.75;
       directionalLight.position.normalize();
       this.scene.addLight( directionalLight );

    }

    Scene1.keyPress = function(key) {
      if(key == 'space') {
/*        VoxelGroup(Math.random()*5,QuintusBuilder.getObjects()).pos(Math.random()*1024 - 512,
        500,
        Math.random()*1024 - 512).addTo(this); */

        VoxelGroup(1,QuintusBuilder.getObjects()).pos(0,500,0).addTo(this);
      //  Math.random()*1024 - 512).addTo(this); 
      }

    }

    Scene1.intersectionClick = function(intersect) {
      var pt = intersect.point;

      var q = QuintusRenderer;
      if(QuintusRenderer.isShiftDown) {
        Voxel(1).pos(q.camera.position.x,50,q.camera.position.z).
          vel(q.direction.x*200,300,q.direction.z*200).
          addTo(this);

      } else {
        VoxelGroup(1,QuintusBuilder.getObjects()).pos(pt.x,pt.y+500,pt.z).addTo(this);
      }

    }

