
//
// Pickup handling
//


OverDrive.Pickup = (function(lib, canvas, context) {

  // Pickup type
  lib.PickupType = function(config) {
  
    this.handler = config.handler;
    this.collisionGroup = config.collisionGroup;
    this.sprite = new OverDrive.Game.Sprite(config.spriteURI);
  }

  
  // Pickup instance
  lib.Pickup = function(config) {
      
    var self = this;
    
    this.type = config.type;
    this.scale = pickup_sprite_scale;
    
    var size = { width : this.type.sprite.image.width * this.scale * config.boundingVolumeScale,
                 height : this.type.sprite.image.height * this.scale * config.boundingVolumeScale };
        
    this.mBody = Matter.Bodies.rectangle(
                                
      config.pos.x,
      config.pos.y,
      size.width,
      size.height,
      {
        isStatic : config.isStatic,
        isSensor : true,
        collisionFilter : { group : config.type.collisionGroup,
                            category : OverDrive.Game.CollisionModel.Pickup.Category,
                            mask : OverDrive.Game.CollisionModel.Pickup.Mask }
      }
    );
    
    
    // DEBUG
    //var vertices = self.mBody.vertices;
    //console.log('pickup at : ' + vertices[0].x + ', ' + vertices[0].y);
    
      
      
    Matter.Body.setMass(this.mBody, 0);  
    this.mBody.hostObject = this;

    this.draw = function() {
      
      if (self.mBody) {
        
        context.save();
        
        var pos = self.mBody.position;
        
        context.translate(pos.x, pos.y);
        context.translate(-self.type.sprite.image.width * self.scale / 2, -self.type.sprite.image.height * self.scale / 2);
        self.type.sprite.draw(0, 0, self.scale);
        
        context.restore();
      
        //this.drawBoundingVolume();
      }
    }

    
    this.drawBoundingVolume = function() {
      
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
    
    
    //
    // Collision interface
    //
    
    this.doCollision = function(otherBody, env) {
      
      otherBody.collideWithPickup(this, {
        
        objA : env.objB,
        objB : env.objA,
        host : env.host
      });
    }
    
    this.collideWithPlayer = function(player, env) {
      
      self.type.handler(player);
      
      // Remove from collections
      Matter.World.remove(OverDrive.Game.system.engine.world, self.mBody);
      env.host.pickupArray.splice(env.host.pickupArray.indexOf(self), 1);
    }
    
    this.collideWithProjectile = function(otherPickup, env) {}
    
    this.collideWithPickup = function(otherPickup, env) {}
    
  }
  
  
  
  // Global pickup handler.  Return an object with the new pickup timer value and any new pickup object that has been created
  lib.processPickups = function(pickupTypes, engine, pickupTime, tDelta, regions) {
    
    var newPickup = null;
    
    pickupTime -= tDelta;
    
    if (pickupTime <= 0) {
      
      let rIndex = Math.floor(Math.random() * (regions.length - 1));
      let pos = Matter.Vertices.centre(regions[rIndex].collisionModel.vertices);
      
      pos.x *= canvas.width;
      pos.y *= canvas.height;
      
      let keys = Object.keys(pickupTypes);
      let numKeys = keys.length;
      let keyIndex = (Math.round(Math.random() * numKeys)) % numKeys;
      let typeKey = keys[keyIndex];
      
      newPickup = new lib.Pickup( { pos : pos,
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
  
  return lib;
    
})((OverDrive.Pickup || {}), OverDrive.canvas, OverDrive.context);
