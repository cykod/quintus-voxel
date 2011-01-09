

QStorage = {};

(function(c) {


  c.set = function(name,val) {
    $.Storage.set(name,val);
  }

  c.get = function(name) {
    $.Storage.get(name);
  }



  return c;
  })(QStorage);



