



Tree = function() {

  this.health = 100;
 
  this.step = function(dt) {
    this.frame = (this.frame + 1) % 2;
  }

  this.damage = function(points) {
    this.health -= points;
    if(this.health < 0) this.explode();
  }


}
