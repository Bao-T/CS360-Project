
//
// Track editor model
//

OverDrive.Editor = (function(lib, canvas, context) {

  lib.EditorModel = function() {
    
    // Flag to determine if the model has been altered since last save
    this.edited = false;
    
    this.trackNumber = 1;
    this.trackImage = OverDrive.Background.Create();
    this.regions = [];
    
    this.players = [
    
      { // player 1
        playerImageURI : '',
        inPlace : false,
        pos : { x : 0, y : 0 },
        angle : 0,
        scale : 1
      },
      
      { // player 2
        playerImageURI : '',
        inPlace : false,
        pos : { x : 0, y : 0 },
        angle : 0,
        scale : 1
      }
    ];    
  }

  return lib;
  
})((OverDrive.Editor || {}), OverDrive.canvas, OverDrive.context);