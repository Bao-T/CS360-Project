
//
// Scenery editor model
//

OverDrive.Editor = (function(lib, canvas, context) {

  lib.EditorModel = function() {
    
    // Flag to determine if the model has been altered since last save
    this.edited = false;
    
    this.trackNumber = 1;
    this.trackImage = OverDrive.Background.Create();
    this.regions = [];
  }

  return lib;
  
})((OverDrive.Editor || {}), OverDrive.canvas, OverDrive.context);
