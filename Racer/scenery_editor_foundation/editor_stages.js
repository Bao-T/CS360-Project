
//
// Editor substage implementation
//

OverDrive.EditorStage = (function(stage, canvas, context) {
  
  stage.Editor.prototype.init = function() {
    
    if (this.bootstrapEditor) {
      
      // Setup event handlers for UI that do not change between stages
      $('#navNew').click(this.newScenery);
      $('#navSave').click(this.saveScenery);
      $('#navExport').click(this.exportScenery);
      $('#loadSceneryModelInput').click(this.preloadSceneryModel);
      $('#loadSceneryModelInput').change(this.loadSceneryModel);
      $('#loadTrackImageInput').click(this.preloadTrackImage);
      $('#loadTrackImageInput').change(this.loadTrackImage);
      $('#trackNumberField').change(this.setTrackNumber);
      
      this.bootstrapEditor = false;
    }
    
    // Setup events for user interaction with the canvas
    $('#canvas').on('mousedown', this.mouseDown);
    $('#canvas').on('mousemove', this.mouseMove);
    $('#canvas').on('mouseenter', this.mouseEnter);
    $('#canvas').on('mouseleave', this.mouseLeave);
    $('#canvas').on('mouseup', this.mouseUp);
    $(document).on('keydown', this.keyDown);

    this.enableElements();
    
    window.requestAnimationFrame(this.mainLoop.bind(this));
  }
   
  // Handle canvas refresh and any editor-specific animations
  stage.Editor.prototype.mainLoop = function() {
  
    if (this.model) {
    
      this.render();
    }
    
    window.requestAnimationFrame(this.mainLoop.bind(this));
  }
  
  return stage;
  
})((OverDrive.EditorStage || {}), OverDrive.canvas, OverDrive.context);
