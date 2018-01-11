
OverDrive.Game = (function(gamelib, canvas, context) {
  
  gamelib.Sprite = function(imageURL, callback) {
    
    var self = this;
    
    this.onLoaded = function() {
    
      self.spriteLoaded = true;
      
      // Callback to host application to handle app-specific post-sprite load event
      if (callback!==undefined) {
        
        let w = self.image.width;
        let h = self.image.height;
      
        callback(w, h);
      }
    }
    
    this.draw = function(x, y, scale) {
    
      if (self.spriteLoaded) {
        
        context.drawImage(self.image, x, y, self.image.width * scale, self.image.height * scale); 
      }
    }
    
    this.spriteLoaded = false;
    this.image = new Image();
    this.image.onload = this.onLoaded;
    this.image.src = imageURL;
  };

  return gamelib;
  
})((OverDrive.Game || {}), OverDrive.canvas, OverDrive.context);