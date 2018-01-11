
//
// Pickup handling
//


// Create new pickup type
function PickupType(config) {

  this.handler = config.handler;
  this.collisionGroup = config.collisionGroup;
  this.sprite = new Sprite(config.spriteURI);
}


// Create new pickup instance
function Pickup(config) {
    
  var self = this;
  
	this.type = config.type;
  this.scale = pickup_sprite_scale;
  
  var size = { width : this.type.sprite.image.width * this.scale * config.boundingVolumeScale,
               height : this.type.sprite.image.height * this.scale * config.boundingVolumeScale};
      
	this.mBody = Matter.Bodies.rectangle(
                              config.pos.x,
                              config.pos.y,
                              size.width,
                              size.height,
                              {
                                  isStatic : config.isStatic,
                                  isSensor : true,
                                  collisionFilter : { group : config.type.collisionGroup,
                                                      category : CollisionModel.Pickup.Category,
                                                      mask : CollisionModel.Pickup.Mask }
                              });
  
  Matter.Body.setMass(this.mBody, 0);  
  this.mBody.hostObject = this;

  this.draw = function(context) {
    
    if (self.mBody) {
      
      context.save();
      
      var pos = self.mBody.position;
      
      context.translate(pos.x, pos.y);
      context.translate(-self.type.sprite.image.width * self.scale / 2, -self.type.sprite.image.height * self.scale / 2);
      self.type.sprite.draw(context, 0, 0, self.scale);
      
      context.restore();
    }
  }

  
  this.drawBoundingVolume = function(context) {
    
    if (self.mBody) {
      
      // Record path of mBody geometry
      context.beginPath();

      var vertices = self.mBody.vertices;
      
      context.moveTo(vertices[0].x, vertices[0].y);
      
      for (var j = 1; j < vertices.length; ++j) {
      
        context.lineTo(vertices[j].x, vertices[j].y);
      }
      
      context.lineTo(vertices[0].x, vertices[0].y);
          
      // Render geometry
      context.lineWidth = 1;
      context.strokeStyle = '#FFFFFF';
      context.stroke();
    }
  }
  
  
  //
  // Collision interface
  //
  
  this.doCollision = function(otherBody, env) {
	  
	  otherBody.collideWithPickup(self, env);
  }
  
  this.collideWithPlayer = function(player, env) {
    
    self.type.handler(player);
    
    // Remove from collections
    Matter.World.remove(system.engine.world, self.mBody);
    env.pickupArray.splice(env.pickupArray.indexOf(self), 1);
  }
  
  this.collideWithProjectile = function(otherPickup, env) {
    
    // Shouldn't happen
    console.log("*** oops");
  }
  
  this.collideWithPickup = function(otherPickup, env) {
    
    // Shouldn't happen
    console.log("*** oops");
  }
  
}


// Global pickup handler.  Return an object with the new pickup timer value and any new pickup object that has been created
function processPickups(pickupTypes, engine, pickupTime, tDelta) {
  
  var newPickup = null;
  
  
  pickupTime -= tDelta;
  
  if (pickupTime <= 0) {
    
    let pos = { x : Math.random() * 800, y : Math.random() * 600 };
    
    let keys = Object.keys(pickupTypes);
    let numKeys = keys.length;
    let keyIndex = (Math.round(Math.random() * numKeys)) % numKeys;
    let typeKey = keys[keyIndex];
    
    newPickup = new Pickup( { pos : pos,
                              type : pickupTypes[typeKey],
                              world : engine.world,
                              boundingVolumeScale : 0.75,
                              isStatic : true
                            } );
    
    // Reset
    pickupTime = pickup_time_delay;
  }
  
  return {
      
    timer : pickupTime,
    newPickup : newPickup
  };
}
