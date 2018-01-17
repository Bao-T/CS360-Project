
//
// Target handling
//


OverDrive.Game = (function(lib, canvas, context) {

    // Pickup instance
    lib.Target = function() {
        
      var self = this;
      var size = { width : 12, height : 12 };
      this.scale = 1;

      this.sprite = new OverDrive.Game.Sprite('Assets/Images/targetsmall.png',
        function(w, h) {
            let size = { width : w * self.scale, height : h * self.scale };
        }
      );
          
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
  