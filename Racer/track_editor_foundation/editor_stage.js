
//
// Editor stage methods (could be included in editor.js)
//


OverDrive.EditorStage = (function(stage, canvas, context) {

  // Handle any setup needed on leaving one state and entering the editor state.  This is not called on any state object when the state graph is initiated.
  stage.Editor.prototype.preTransition = function() {
    
    this.enableElements();
    
    //window.requestAnimationFrame(this.init.bind(this));
  }
  
  // Setup event handlers for the editor stage
  stage.Editor.prototype.init = function() {
    
    console.log('editor : init');
    
    if (this.bootstrapEditor) {
      
      // Setup event handlers for UI that do not change between stages
      $('#navNew').click(this.newTrack);
      $('#navSave').click(this.saveTrack);
      $('#navDelete').click(this.deleteTrack);
      $('#navTest').click(this.testTrack);
      $('#navExport').click(this.exportTrack);
      $('#loadTrackModelInput').click(this.preloadTrackModel);
      $('#loadTrackModelInput').change(this.loadTrackModel);
      
      $('#loadTrackImageInput').click(this.preloadTrack);
      $('#loadTrackImageInput').change(this.loadTrackImage);
      
      $('#trackNumberField').change(this.setTrackNumber);
      
      $('#loadPlayer1ImageInput').change(this.loadPlayer1Image);
      $('#player1PlaceButton').click(this.startPlayer1Placement);
      $('#player1DeleteButton').click(this.deletePlayer1);
      $('#player1ScaleText').change(this.updatePlayer1ScaleSlider);
      $('#player1ScaleSlider').on('input', this.updatePlayer1ScaleText);
      $('#player1AngleText').change(this.updatePlayer1AngleSlider);
      $('#player1AngleSlider').on('input', this.updatePlayer1AngleText);
      
      $('#loadPlayer2ImageInput').change(this.loadPlayer2Image);
      $('#player2PlaceButton').click(this.startPlayer2Placement);
      $('#player2DeleteButton').click(this.deletePlayer2);
      $('#player2ScaleText').change(this.updatePlayer2ScaleSlider);
      $('#player2ScaleSlider').on('input', this.updatePlayer2ScaleText);
      $('#player2AngleText').change(this.updatePlayer2AngleSlider);
      $('#player2AngleSlider').on('input', this.updatePlayer2AngleText);
      
      this.bootstrapEditor = false;
    }
          
    // Setup events for user interaction with the canvas
    $('#canvas').on('mousedown', this.mouseDown);
    $('#canvas').on('mousemove', this.mouseMove);
    $('#canvas').on('mouseenter', this.mouseEnter);
    $('#canvas').on('mouseleave', this.mouseLeave);
    $('#canvas').on('mouseup', this.mouseUp);
    $(document).on('keydown', this.keyDown);
    
    // Initialise transition state
    this.enterTest = false;
    
    this.enableElements();
    
    window.requestAnimationFrame(this.mainLoop.bind(this));
  }
  
  //stage.Editor.prototype.phaseInLoop = function() {}
  
  // Handle canvas refresh and any editor-specific animations
  stage.Editor.prototype.mainLoop = function() {
    
    this.drawEditorScene();
    
    if (!this.enterTest) {
    
      window.requestAnimationFrame(this.mainLoop.bind(this));
    }
    else {
    
      // Enter test stage - handle transition-specific code here
      this.leaveState.id = 'test';
      
      window.requestAnimationFrame(this.leaveStage.bind(this));
    }
  }
  
  //stage.Editor.prototype.initPhaseOut = function() {}
    
  //stage.Editor.prototype.phaseOutLoop = function() {}
    
  stage.Editor.prototype.leaveStage = function() {
    
    // Disable editor interface
    $('#li_navNew').attr('class', 'disabled');
    $('#li_navOpen').attr('class', 'disabled');
    $('#li_navSave').attr('class', 'disabled');
    $('#li_navDelete').attr('class', 'disabled');
    $('#li_navTest').attr('class', 'disabled');
    $('#li_navExport').attr('class', 'disabled');
    
    $('#trackNumberField').prop('disabled', true);
    $('#trackImageImportButton').prop('disabled', true);
      
    $('#player1Icon').prop('disabled', true);
    $('#player1PlaceButton').prop('disabled', true);
    $('#player1SettingsButton').prop('disabled', true);
    $('#player1DeleteButton').prop('disabled', true);
    $('#player1ScaleText').prop('disabled', true);
    $('#player1ScaleSlider').prop('disabled', true);
    $('#player1AngleText').prop('disabled', true);
    $('#player1AngleSlider').prop('disabled', true);
    
    $('#player2Icon').prop('disabled', true);
    $('#player2PlaceButton').prop('disabled', true);
    $('#player2SettingsButton').prop('disabled', true);
    $('#player2DeleteButton').prop('disabled', true);
    $('#player2ScaleText').prop('disabled', true);
    $('#player2ScaleSlider').prop('disabled', true);
    $('#player2AngleText').prop('disabled', true);
    $('#player2AngleSlider').prop('disabled', true);
    
    // Remove editor-specific events
    $('#canvas').off('mousedown', this.mouseDown);
    $('#canvas').off('mousemove', this.mouseMove);
    $('#canvas').off('mouseenter', this.mouseEnter);
    $('#canvas').off('mouseleave', this.mouseLeave);
    $('#canvas').off('mouseup', this.mouseUp);
    $(document).off('keydown', this.keyDown);
    

    // Setup general state to pass to next stage
    this.leaveState.params = { model : this.model };
    
    var target = this.transitionLinks[this.leaveState.id];
    
    // Handle pre-transition (in target, not here! - encapsulation!)
    target.preTransition(this.leaveState.params);

    // Final transition from current stage
    
    window.requestAnimationFrame(target.init.bind(target));
    
    // Clear leave state once done
    this.leaveState.id = null;
    this.leaveState.params = null;
  }
  
  return stage;
  
})((OverDrive.EditorStage || {}), OverDrive.canvas, OverDrive.context);
