
//
// Collision categories and masks for types in the game
//


OverDrive.Game = (function(gamelib, canvas, context) {
  
  gamelib.CollisionModel = {
    
    StaticScene : {
      
      Category :  0b000001,
      Mask :      0b000010
    },
    
    Player : {
      
      Category :  0b000010,
      Mask :      0b111111
    },
    
    Projectile : {
      
      Category :  0b000100,
      Mask :      0b010110
    },
    
    Pickup : {
      
      Category :  0b001000,
      Mask :      0b000110
    },
    
    // Collision filter for ANY NPC
    NPC : {
      
      Category :  0b010000,
      Mask :      0b000110
    },
    
    // Path element (sensor)
    PathNode : {
      
      Category :  0b100000,
      Mask :      0b000010
    }
    
  }

  return gamelib;
  
})((OverDrive.Game || {}), OverDrive.canvas, OverDrive.context);