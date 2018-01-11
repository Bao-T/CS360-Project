
// Game background

OverDrive.Game = (function(gamelib, canvas, context) {
  
  gamelib.Background = function(imageURL) {

    var self = this;
    
    this.onLoaded = function() {

      self.backgroundLoaded = true;
    }

    this.draw = function() {

      if (self.backgroundLoaded) {
              
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(self.image, 0, 0, canvas.width, canvas.height); 
      }
    }

    this.backgroundLoaded = false;
    this.image = new Image();
    this.image.onload = this.onLoaded();
    this.image.src = imageURL;
  }


  return gamelib;
  
})((OverDrive.Game || {}), OverDrive.canvas, OverDrive.context);