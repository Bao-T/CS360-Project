
//
// Target handling
//


OverDrive.Game = (function(lib, canvas, context) {

    // Pickup instance
    lib.Target = function(config) {
        
      var self = this;
      this.sprite = new OverDrive.Game.Sprite('Assets/Images/target.js');
      var size = { width : 12, height : 12 };
          
      this.draw = function(x, y) {
        
        context.save();
        
        context.translate(x, y);
        context.translate(-self.sprite.image.width * self.scale / 2, -self.sprite.image.height * self.scale / 2);
        self.sprite.draw(0, 0, self.scale);
        
        context.restore();
      }
  
    }
    
    return lib;
      
  })((OverDrive.Game || {}), OverDrive.canvas, OverDrive.context);
  