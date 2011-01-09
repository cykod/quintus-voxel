
    var Scene1= new QuintusScene();


    Scene1.init = function() {
      this.scene = new THREE.Scene();
      this.particles = [];

      this.material =new THREE.MeshBasicMaterial( { color: 0x0000ff, opacity: 0.5 } ) 

      this.material2 = new THREE.MeshBasicMaterial( { map: ImageUtils.loadTexture( 'img/grass_subtle.jpg')} );

      this.material3 = new THREE.MeshLambertMaterial({ color: 0xFF0000, shading: THREE.SmoothShading });
      this.material4 = new THREE.MeshLambertMaterial( { map: ImageUtils.loadTexture( 'img/concrete.jpg'), shading: THREE.SmoothShading } );

      Voxel(1,this.material).pos(0, 300, 20).addTo(this);
      //   Voxel(1,this.material2).pos(500, 400, 0).addTo(this);
      //   Voxel(1,this.material2).pos(500, 400, 256).addTo(this);
      Voxel(1,this.material2).pos(0, 600, 0).addTo(this);

      this.plane = new THREE.Mesh(new Plane(1024,1024,16,16),this.material2);
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
        Voxel(Math.random()*5,this.material4).pos(Math.random()*1024 - 512,
        2048,
        Math.random()*1024 - 512).addTo(this);
      }

    }

