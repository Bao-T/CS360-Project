
OverDrive.Background = (function(bl, canvas, context) {

  function Background() {
    
    var self = this;
    
    this.loaded = false;
    this.image = null;
    this.imageURL = "";
    
    // Background interface
    
    this.load = function(imageURL, callback) {
            
      self.image = new Image();
      
      self.image.onload = function() {
        
        self.loaded = true;
        self.imageURL = imageURL;
        
        if (callback !== undefined) {
          
          callback(self);
        }
      };
      
      self.image.src = imageURL;
    }
    
    this.render = function() {

      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      if (self.loaded == false) {
          
        // Render no track message
        context.fillStyle = '#000';
        context.font = '18px Arial';
        
        let messageString = '--- No track image loaded ---';
        var textMetrics = context.measureText(messageString);
        context.fillText(messageString, (canvas.width / 2) - (textMetrics.width / 2), canvas.height / 2);
      }
      else {
        
        // Render image
        context.drawImage(self.image, 0, 0, canvas.width, canvas.height);
      }
    }
  }
  
  // Create empty background
  bl.Create = function() {
    
    return new Background();
  }

  // Async load
  bl.Load = function(bgnd, imageURL, callback) {

    bgnd.load(imageURL, callback);
  }
  
  bl.Render = function(bgnd) {
    
    bgnd.render();
  }
  

  return bl;
  
})((OverDrive.Background || {}), OverDrive.canvas, OverDrive.context);
