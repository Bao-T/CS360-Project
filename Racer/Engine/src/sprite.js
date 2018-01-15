
OverDrive.Game = (function(gamelib, canvas, context) {
  
  gamelib.Sprite = function(imageURL, callback) {
    
    var self = this;
    var alpha = 1;
	var fader = 0;
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
		//context.drawImage(arrow, x, y, self.image.width * scale, self.image.height * scale); 
      }
    }
	 this.drawball = function(x, y, scale) {
    
      if (self.spriteLoaded) {
		context.save();
		context.globalAlpha=1;
        context.drawImage(self.image, x, y, self.image.width * scale, self.image.height * scale);
		context.restore();
		context.save();
		fader = fader + 0.01;
		if (fader >= 1){
			fader = -1
		}
		context.globalAlpha=Math.abs(fader);
		context.drawImage(arrow, x, y-20, self.image.width * scale, self.image.height*2);
		context.restore();
      }
    }
    var arrow = new Image();
    arrow.onload = this.onLoaded;
	arrow.src = "Assets//Images//arrow.png";
    this.spriteLoaded = false;
    this.image = new Image();
    this.image.onload = this.onLoaded;
    this.image.src = imageURL;
  };

  return gamelib;
  
})((OverDrive.Game || {}), OverDrive.canvas, OverDrive.context);