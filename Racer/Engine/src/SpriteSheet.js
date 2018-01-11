
//
// Extended sprite model to manage sprite sheet arrangements
// Indexing sprites is as follows...
// 
// Row arrangement (rows = 1. cols = n)...
// [0 1 2 3 ... n]
//
// Column arrangement (rows = n, cols = 1)...
// [ 0 ]
// [ 1 ]
// [ 2 ]
// [...]
// [ n ]
//
// Rectangular (rows=n, cols = m)  For illustration, m=3, n=3
// [0 1 2]
// [3 4 5]
// [6 7 8]
//

OverDrive.Game = (function(gamelib, canvas, context) {

  gamelib.SpriteSheet = function(imageURL, sheetConfig, callback) {
    
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
    
    // Draw frame i from sprite sheet at given coordinates (x, y)
    this.draw = function(context, x, y, scale, i) {
    
      if (self.spriteLoaded && i>=0 && i<(self.rows * self.cols)) {
        
        context.drawImage(
        
          self.image,
          (i % self.cols) * self.spriteWidth,
          (i - (i % self.cols)) / self.cols * self.spriteHeight,
          self.spriteWidth,
          self.spriteHeight,
          x,
          y,
          self.spriteWidth * scale,
          self.spriteHeight * scale); 
      }
    }
    
    // Store meta-data about the sprite-sheet
    this.rows = sheetConfig.numberOfRows;
    this.cols = sheetConfig.numberOfColums;
    this.spriteWidth = sheetConfig.spriteWidth;
    this.spriteHeight = sheetConfig.spriteHeight;
    this.framesPerSecond = sheetConfig.framesPerSecond;
    this.invFPS = 1 / this.framesPerSecond; // Number of seconds per frame
    
    this.spriteLoaded = false;
    this.image = new Image();
    this.image.onload = this.onLoaded;
    this.image.src = imageURL;
  };

  
  return gamelib;
  
})((OverDrive.Game || {}), OverDrive.canvas, OverDrive.context);
