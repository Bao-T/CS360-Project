
//
// OverDrive track model editor
//

OverDrive.EditorStage = (function(stage, canvas, context) {
    
  stage.Create = function() {
    
    var editor = new stage.Editor();
    
    editor.elementActivationMap = [];
    
    editor.elementActivationMap['#li_navNew'] = function(env) {
      
      $('#li_navNew').attr('class', null);
      return true;
    };
    
    editor.elementActivationMap['#li_navOpen'] = function(env) {
      
      $('#li_navOpen').attr('class', null);
      return true;
    };
    
    editor.elementActivationMap['#li_navSave'] = function(env) {
      
      var isEnabled = (env.model != null && env.model.edited == true);
      $('#li_navSave').attr('class', isEnabled ? null : 'disabled');
      return isEnabled;
    };
    
    editor.elementActivationMap['#li_navDelete'] = function(env) {
      
      var isEnabled = (env.model != null);
      $('#li_navDelete').attr('class', isEnabled ? null : 'disabled');
      return isEnabled;
    };
    
    editor.elementActivationMap['#li_navTest'] = function(env) {
      
      var isEnabled = (env.model != null && env.model.regions.length >= 2 && env.model.players[0].inPlace==true && env.model.players[1].inPlace==true);
      $('#li_navTest').attr('class', isEnabled ? null : 'disabled');
      return isEnabled;
    };
    
    editor.elementActivationMap['#li_navExport'] = function(env) {
      
      var isEnabled = env.model != null;
      $('#li_navExport').attr('class', isEnabled ? null : 'disabled');
      return isEnabled;
    };
    
    editor.elementActivationMap['#trackNumberLabel'] = function(env) {
      
      var isEnabled = (env.model != null);
      var colorString = (isEnabled) ? '#000' : '#888';
      $('#trackNumberLabel').css('color',  colorString);
      
      return isEnabled;
    };
    
    editor.elementActivationMap['#trackNumberField'] = function(env) {
      
      var isEnabled = (env.model != null);
      $('#trackNumberField').prop('disabled', !isEnabled);
      
      return isEnabled;
    };
    
    editor.elementActivationMap['#trackImageImportButton'] = function(env) {
      
      var isEnabled = (env.model != null);
      $('#trackImageImportButton').prop('disabled', !isEnabled);
      
      return isEnabled;
    };
    
    editor.elementActivationMap['#trackFileNameLabel'] = function(env) {
      
      var isEnabled = (env.model != null);
      var colorString = (isEnabled) ? '#000' : '#888';
      $('#trackFileNameLabel').css('color',  colorString);
      
      return isEnabled;
    };
    
    editor.elementActivationMap['#player1Icon'] = function(env) {
      
      var isEnabled = (env.model != null);
      $('#player1Icon').prop('disabled', !isEnabled);
      
      return isEnabled;
    };
        
    editor.elementActivationMap['#player1PlaceButton'] = function(env) {
      
      var isEnabled = (env.model != null && env.model.players[0].playerImageURI!=='' && env.model.regions.length > 0);
      $('#player1PlaceButton').prop('disabled', !isEnabled);
      
      return isEnabled;
    };
    
    editor.elementActivationMap['#player1SettingsButton'] = function(env) {
      
      var isEnabled = (env.model != null && env.model.players[0].playerImageURI!=='');
      
      var colorString = (isEnabled) ? '#000' : '#888';
      
      $('#player1SettingsButton').prop('disabled', !isEnabled);
      
      $('#player1ScaleLabel').css('color',  colorString);
      $('#player1ScaleText').prop('disabled', !isEnabled);
      $('#player1ScaleSlider').prop('disabled', !isEnabled);
      
      $('#player1AngleLabel').css('color',  colorString);
      $('#player1AngleText').prop('disabled', !isEnabled);
      $('#player1AngleSlider').prop('disabled', !isEnabled);
      
      return isEnabled;
    };
    
    editor.elementActivationMap['#player1DeleteButton'] = function(env) {
      
      var isEnabled = (env.model != null && env.model.players[0].playerImageURI!=='' && env.currentPlayerPlacement==0);
      $('#player1DeleteButton').prop('disabled', !isEnabled);
      
      return isEnabled;
    };
    
    editor.elementActivationMap['#player2Icon'] = function(env) {
      
      var isEnabled = (env.model != null);
      $('#player2Icon').prop('disabled', !isEnabled);
      
      return isEnabled;
    };
    
    editor.elementActivationMap['#player2PlaceButton'] = function(env) {
      
      var isEnabled = (env.model != null && env.model.players[1].playerImageURI!=='' && env.model.regions.length > 0);
      
      $('#player2PlaceButton').prop('disabled', !isEnabled);
      
      return isEnabled;
    };
    
    editor.elementActivationMap['#player2SettingsButton'] = function(env) {
      
      var isEnabled = (env.model != null && env.model.players[1].playerImageURI!=='');
      
      var colorString = (isEnabled) ? '#000' : '#888';
      
      $('#player2SettingsButton').prop('disabled', !isEnabled);
      
      $('#player2ScaleLabel').css('color',  colorString);
      $('#player2ScaleText').prop('disabled', !isEnabled);
      $('#player2ScaleSlider').prop('disabled', !isEnabled);
      
      $('#player2AngleLabel').css('color',  colorString);
      $('#player2AngleText').prop('disabled', !isEnabled);
      $('#player2AngleSlider').prop('disabled', !isEnabled);
      
      return isEnabled;
    };
    
    editor.elementActivationMap['#player2DeleteButton'] = function(env) {
      
      var isEnabled = (env.model != null && env.model.players[1].playerImageURI!=='' && env.currentPlayerPlacement==0);
      
      $('#player2DeleteButton').prop('disabled', !isEnabled);
      
      return isEnabled;
    };
    
    
    return editor;
  }
  
  return stage;
  
})((OverDrive.EditorStage || {}), OverDrive.canvas, OverDrive.context);


OverDrive.EditorStage = (function(stage, canvas, context) {
  
  //
  // Private API
  //
  
  // Player scale configuration constants (move to config later)
  const sigma = 2;
  const range = 20;
  const maxScale = sigma + 1;
  
  // Map scale value to slider ranger value
  var calcScaleSliderValue = function(scale, sigma = 2, range = 20) {
    
    return (scale <= 1) ? scale * (range / 2) : ((scale -  1) / sigma) * (range - (range / 2)) + (range / 2);
  }

  // Map slider range value to scale value
  var calcScaleFieldValue = function(sliderValue, sigma = 2, range = 20) {
    
    return (sliderValue <= (range / 2)) ? sliderValue / (range / 2) : (sliderValue - (range / 2)) / (range - (range / 2)) * sigma + 1;
  }
  
  var canEditTrack = function(env) {
    
    return (env.model && env.model.trackImage && env.model.trackImage.loaded);
  }
  
  
  //
  // Public API
  //
  
  stage.Editor = function(/*hostModel*/) {
    
    var self = this;
  
    this.transitionLinks = {
      
      test : null
    };
    
    this.setTransition = function(id, target) {
      
      self.transitionLinks[id] = target;
    }
    
    
      
    this.model = null;
  
    this.newRegion = null;

    // Track existing region vertices in proximity to mouse cursor
    this.proximityThreshold = 20; // 20 pixel radius
    this.proximityList = null;
        
    // Disjoint list of points {coord, region index, point index} from regions not in proximityList
    this.pStatic = null;
        
    this.moveVertices = false;
    
    // Default to true - if actually false on init okay since enter event will make this true when the mouse enters canvas.  Will not affect interaction since above entry event needs to fire before any other interaction with the canvas can occur.
    this.mouseInCanvas = true;
    
    this.currentMousePos = { x : 0, y : 0 };
    
    //this.canBuildTrack = false;
    
    // 0 = not in placement mode, 1 = player1, 2 = player2
    this.currentPlayerPlacement = 0; 
    
    this.enterTest = false;
    
    //this.fieldStatus;
    
    // On init we want to perform initial setup - but only once!
    this.bootstrapEditor = true;
    
    // Exit transition state (picked up by leaveStage)
    this.leaveState = {
      
      id : null,
      params : null
    };
    
    
    
    //
    // Stage interface implementation
    //
    
    // Pre-start stage with relevant parameters
    /*
    this.preTransition = function(params) {
      
      // Re-establish field status
      
      $('#li_navNew').attr('class', (self.fieldStatus.navNew === undefined) ? null : self.fieldStatus.navNew);
      $('#li_navOpen').attr('class', (self.fieldStatus.navOpen === undefined) ? null : self.fieldStatus.navOpen);
      $('#li_navSave').attr('class', (self.fieldStatus.navSave === undefined) ? null : self.fieldStatus.navSave);
      $('#li_navDelete').attr('class', (self.fieldStatus.navDelete === undefined) ? null : self.fieldStatus.navDelete);
      $('#li_navTest').attr('class', (self.fieldStatus.navTest === undefined) ? null : self.fieldStatus.navTest);
      $('#li_navExport').attr('class', (self.fieldStatus.navExport === undefined) ? null : self.fieldStatus.navExport);
      
      $('#trackNumberField').prop('disabled', self.fieldStatus.trackNumberField);
      $('#trackImageImportButton').prop('disabled', self.fieldStatus.trackImageImportButton);
      
      $('#player1Icon').prop('disabled', self.fieldStatus.player1Icon);
      $('#player1PlaceButton').prop('disabled', self.fieldStatus.player1PlaceButton);
      $('#player1SettingsButton').prop('disabled', self.fieldStatus.player1SettingsButton);
      $('#player1DeleteButton').prop('disabled', self.fieldStatus.player1DeleteButton);
      $('#player1ScaleText').prop('disabled', self.fieldStatus.player1ScaleText);
      $('#player1ScaleSlider').prop('disabled', self.fieldStatus.player1ScaleSlider);
      $('#player1AngleText').prop('disabled', self.fieldStatus.player1AngleText);
      $('#player1AngleSlider').prop('disabled', self.fieldStatus.player1AngleSlider);
      
      $('#player2Icon').prop('disabled', self.fieldStatus.player2Icon);
      $('#player2PlaceButton').prop('disabled', self.fieldStatus.player2PlaceButton);
      $('#player2SettingsButton').prop('disabled', self.fieldStatus.player2SettingsButton);
      $('#player2DeleteButton').prop('disabled', self.fieldStatus.player2DeleteButton);
      $('#player2ScaleText').prop('disabled', self.fieldStatus.player2ScaleText);
      $('#player2ScaleSlider').prop('disabled', self.fieldStatus.player2ScaleSlider);
      $('#player2AngleText').prop('disabled', self.fieldStatus.player2AngleText);
      $('#player2AngleSlider').prop('disabled', self.fieldStatus.player2AngleSlider);
    }
    */
    
    // Setup event handlers for the editor
    /*this.init = function() {
      
      console.log('editor : init');
      
      if (self.bootstrapEditor) {
        
        // Setup event handlers for UI that do not change between stages
        $('#navNew').click(self.newTrack);
        $('#navSave').click(self.saveTrack);
        $('#navDelete').click(self.deleteTrack);
        $('#navTest').click(self.testTrack);
        $('#navExport').click(self.exportTrack);
        
        $('#loadTrackModelInput').on('click', self.preloadTrackModel);
        $('#loadTrackModelInput').on('change', self.loadTrackModel);
                
        document.getElementById('loadTrackImageInput').addEventListener('click', self.preloadTrack);
        document.getElementById('loadTrackImageInput').addEventListener('change', self.loadTrackImage);
        
        document.getElementById('trackNumberField').addEventListener('change', self.setTrackNumber);
        
        document.getElementById('loadPlayer1ImageInput').addEventListener('change', self.loadPlayer1Image);
        document.getElementById('player1PlaceButton').addEventListener('click', self.startPlayer1Placement);
        document.getElementById('player1ScaleText').addEventListener('change', self.updatePlayer1ScaleSlider);
        document.getElementById('player1ScaleSlider').addEventListener('input', self.updatePlayer1ScaleText);
        document.getElementById('player1AngleText').addEventListener('change', self.updatePlayer1AngleSlider);
        document.getElementById('player1AngleSlider').addEventListener('input', self.updatePlayer1AngleText);
        
        document.getElementById('loadPlayer2ImageInput').addEventListener('change', self.loadPlayer2Image);
        document.getElementById('player2PlaceButton').addEventListener('click', self.startPlayer2Placement);
        document.getElementById('player2ScaleText').addEventListener('change', self.updatePlayer2ScaleSlider);
        document.getElementById('player2ScaleSlider').addEventListener('input', self.updatePlayer2ScaleText);
        document.getElementById('player2AngleText').addEventListener('change', self.updatePlayer2AngleSlider);
        document.getElementById('player2AngleSlider').addEventListener('input', self.updatePlayer2AngleText);
        
        self.bootstrapEditor = false;
      }
            
      // Setup events for user interaction with the canvas
      $('#canvas').on('mousedown', self.mouseDown);
      $('#canvas').on('mousemove', self.mouseMove);
      $('#canvas').on('mouseenter', self.mouseEnter);
      $('#canvas').on('mouseleave', self.mouseLeave);
      $('#canvas').on('mouseup', self.mouseUp);
      $(document).on('keydown', self.keyDown);
      
      // Initialise transition state
      self.enterTest = false;
      
      window.requestAnimationFrame(self.mainLoop);
    }
    */
    
    // Handle canvas refresh and any editor-specific animations
    /*this.mainLoop = function() {
    
      self.render();
      
      if (!self.enterTest) {
      
        window.requestAnimationFrame(self.mainLoop);
      }
      else {
      
        // Enter test stage - setup transition-specific parameters as needed here
        
        // Handle transition-specific code here
        self.leaveState.id = 'test';
        
        window.requestAnimationFrame(self.leaveStage);
      }
    }*/
    
    // Not used for transition from the editor
    //this.initPhaseOut = function() {}
    
    // Not used for transition from the editor
    //this.phaseOutLoop = function() {}
    
    /*this.leaveStage = function() {
      
      // Save element activation status for re-entry into editor
      self.fieldStatus = {
        
        navNew : $('#li_navNew').attr('class'),
        navOpen : $('#li_navOpen').attr('class'),
        navSave : $('#li_navSave').attr('class'),
        navDelete : $('#li_navDelete').attr('class'),
        navTest : $('#li_navTest').attr('class'),
        navExport : $('#li_navExport').attr('class'),
        
        trackNumberField : $('#trackNumberField').prop('disabled'),
        trackImageImportButton : $('#trackImageImportButton').prop('disabled'),
        
        player1Icon : $('#player1Icon').prop('disabled'),
        player1PlaceButton : $('#player1PlaceButton').prop('disabled'),
        player1SettingsButton : $('#player1SettingsButton').prop('disabled'),
        player1DeleteButton : $('#player1DeleteButton').prop('disabled'),
        player1ScaleText : $('#player1ScaleText').prop('disabled'),
        player1ScaleSlider : $('#player1ScaleSlider').prop('disabled'),
        player1AngleText : $('#player1AngleText').prop('disabled'),
        player1AngleSlider : $('#player1AngleSlider').prop('disabled'),
        
        player2Icon : $('#player2Icon').prop('disabled'),
        player2PlaceButton : $('#player2PlaceButton').prop('disabled'),
        player2SettingsButton : $('#player2SettingsButton').prop('disabled'),
        player2DeleteButton : $('#player2DeleteButton').prop('disabled'),
        player2ScaleText : $('#player2ScaleText').prop('disabled'),
        player2ScaleSlider : $('#player2ScaleSlider').prop('disabled'),
        player2AngleText : $('#player2AngleText').prop('disabled'),
        player2AngleSlider : $('#player2AngleSlider').prop('disabled')
      }
      
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
      $('#canvas').off('mousedown', self.mouseDown);
      $('#canvas').off('mousemove', self.mouseMove);
      $('#canvas').off('mouseenter', self.mouseEnter);
      $('#canvas').off('mouseleave', self.mouseLeave);
      $('#canvas').off('mouseup', self.mouseUp);
      $(document).off('keydown', self.keyDown);
      

      // Setup general state to pass to next stage
      self.leaveState.params = { model : self.model };
      
      // Handle pre-transition (in target, not here! - encapsulation!)
      self.transitionLinks[self.leaveState.id].preTransition(self.leaveState.params);

      // Final transition from current stage
      window.requestAnimationFrame(self.transitionLinks[self.leaveState.id].init);
      
      // Clear leave state once done
      self.leaveState.id = null;
      self.leaveState.params = null;
    }*/
    
    this.drawEditorScene = function() {
      
      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      if (this.model) {
      
        this.renderModel();
      }
    }
    
    
    this.renderModel = function() {
    
      OverDrive.Background.Render(this.model.trackImage);

      // Draw previous regions (closed loops)
      var regionFillColour = '#00F';
      
      for (var i=0; i< this.model.regions.length; ++i) {
      
        if (this.currentPlayerPlacement > 0) {
        
          if (Matter.Vertices.contains(this.model.regions[i].collisionModel.vertices, this.currentMousePos)) {
            
            if (i==0) {
            
              regionFillColour = '#0F0';
            }
            else {
            
              regionFillColour = '#F00';
            }
          }
          else {
            
            regionFillColour = '#00F';
          }
        }
      
        OverDrive.Region.Render(this.model.regions[i], true, regionFillColour);
      }
    
      // Draw links between regions
      OverDrive.Graph.Render(this.model.regions);
      
      // Draw region being created and associated overlay
      if (this.newRegion != null) {
      
        // Render edge and vertex geometry
        
        context.beginPath();
        
        context.moveTo(this.newRegion.points[0].x * canvas.width, this.newRegion.points[0].y * canvas.height);
        
        for (var j = 1; j < this.newRegion.points.length; ++j) {
  
          context.lineTo(this.newRegion.points[j].x * canvas.width, this.newRegion.points[j].y * canvas.height);
        }
        
        if (this.mouseInCanvas == true) {
        
          if (this.newRegion.points.length > 0) {
          
            context.lineTo(this.currentMousePos.x * canvas.width, this.currentMousePos.y * canvas.height);
          }
          
          // Render region geometry
          context.lineWidth = 1;
          context.strokeStyle = '#0F0';
          context.stroke();
        }
        else {
        
          // Render region geometry
          context.lineWidth = 1;
          context.strokeStyle = '#FFF';
          context.stroke();
          
          // Trace red border around the canvas
          context.beginPath();
        
          context.moveTo(0, 0);
          context.lineTo(canvas.width - 1, 0);
          context.lineTo(canvas.width - 1, canvas.height - 1);
          context.lineTo(0, canvas.height - 1);
          context.lineTo(0, 0);
          
          context.lineWidth = 4;
          context.strokeStyle = '#F00';
          context.stroke();
        }
        
        // Draw vertices for newRegion
        context.fillStyle = '#FFF';
        
        for (var j = 0; j < this.newRegion.points.length; ++j) {
        
          context.beginPath();
          context.arc(this.newRegion.points[j].x * canvas.width, this.newRegion.points[j].y * canvas.height, 3, 0, 2 * Math.PI);
          context.fill();
        }
        
      
        // Render overlay for new region
        
        // Draw points in proximity to current point of newRegion being traced
        if (this.proximityList.numPoints() > 0) {
        
          // Render closeLoopPoint last since this must overlay any other in-proximity points
          if (this.proximityList.closeLoopPoint != null) {
          
            // Now, if <=2 points (including inital close-loop point) are defined in newRegion
            // we cannot close the loop, so show this in red, otherwise show this in green
            if (this.newRegion.points.length <= 2) {
              
              context.fillStyle = '#F00';
            }
            else {
              
              context.fillStyle = '#0F0';
            }
            
            context.beginPath();
            context.arc(this.proximityList.closeLoopPoint.x * canvas.width, this.proximityList.closeLoopPoint.y * canvas.height, 5, 0, 2 * Math.PI);
            context.fill();
          }
          else {
            
            // If close-loop point is not in proximity (since this has highest priority)...
            
            // First overlay any newRegion points in proximity with red - we cannot connect to these!
            context.fillStyle = '#F00';
            
            for (var i=0; i<this.proximityList.newRegionPoints.length; ++i) {
            
              context.beginPath();
              context.arc(this.proximityList.newRegionPoints[i].x * canvas.width, this.proximityList.newRegionPoints[i].y * canvas.height, 5, 0, 2 * Math.PI);
              context.fill();
            }
            
            // Render points in other regions with green overlay
            context.fillStyle = '#0F0';
            
            for (var i=0; i<this.proximityList.points.length; ++i) {
            
              context.beginPath();
              context.arc(this.proximityList.points[i].coord.x * canvas.width, this.proximityList.points[i].coord.y * canvas.height, 5, 0, 2 * Math.PI);
              context.fill();
            }
          
          }
        }
      }
      else {
    
        // No new region is being defined, so mouse cursor is moving 'freely'.  Look for any point
        // in previously defined regions and render according to proximity
        
        if (this.currentPlayerPlacement > 0 && this.mouseInCanvas) {
          
          let idString = 'player' + this.currentPlayerPlacement + 'Draggable';
          
          drawPlayer(document.getElementById(idString), this.model.players[this.currentPlayerPlacement - 1], this.currentMousePos);
        }
        else {
        
          if (this.proximityList != null) {
        
            context.fillStyle = '#0F0';
            
            for (var i=0; i<this.proximityList.points.length; ++i) {
            
              context.beginPath();
              context.arc(this.proximityList.points[i].coord.x * canvas.width, this.proximityList.points[i].coord.y * canvas.height, 5, 0, 2 * Math.PI);
              context.fill();
            }
          }
          
          // If we're dragging vertices, look for proximity to static points and
          // render target accordingly.
          if (this.moveVertices) {
          
            let D = this.proximityList.points;
          
            for (var i=0; i < D.length; ++i) {
            
              var S = OverDrive.Proximity.GetStaticPointsInProximity(D[i].coord, this.pStatic, this.proximityThreshold);
              
              if (S.length > 0) {
              
                for (var j=0; j < S.length; ++j) {
                
                  if (S[j].regionIndex != D[i].regionIndex) {
                  
                    context.strokeStyle = '#0F0';
                    context.beginPath();
                    context.arc(S[j].coord.x * canvas.width, S[j].coord.y * canvas.height, 10, 0, 2 * Math.PI);
                    context.stroke();
                  }
                }                
              }
            }
          }
        }
      }
    
      // Render placed players
      if (this.model.players[0].inPlace) {
        
        drawPlayer(document.getElementById('player1Draggable'), this.model.players[0]);
      }
      
      if (this.model.players[1].inPlace) {
        
        drawPlayer(document.getElementById('player2Draggable'), this.model.players[1]);
      }
      
      function drawPlayer(img, playerModel, mouseCoord) {
        
        if (img.complete) {
        
          let w = img.width * playerModel.scale;
          let h = img.height * playerModel.scale;
                    
          let pos = (playerModel.inPlace==false && mouseCoord!==undefined) ? mouseCoord : playerModel.pos;
          
          context.save();
          
          context.translate(pos.x * canvas.width, pos.y * canvas.height);
          context.rotate(playerModel.angle);
          context.translate(-w / 2, -h / 2);
          context.drawImage(img, 0, 0, w, h);
          
          context.restore();
        }        
      }
    }
    
    
    // Event handlers
    
    // Navbar event handlers
    this.newTrack = function(event) {
    
      var proceed = true;
      
      if (self.model && self.model.edited===true) {
        
        proceed = window.confirm('You\'re creating a new track model.  Any changes made to the current track will be lost.  Do you want to proceed?');
      }
      
      if (proceed) {
      
        // Create new model
        self.model = new OverDrive.Editor.EditorModel();
        
        // Setup DOM
        $('#trackNumberField').val(self.model.trackNumber);
        $('#trackFileNameLabel').html('(No track image selected)');
        
        $('#player1Icon').html('<span class="glyphicon glyphicon-picture" aria-hidden="true"></span>');
        $('#player1ScaleText').val(self.model.players[0].scale);
        $('#player1ScaleSlider').val(calcScaleSliderValue(self.model.players[0].scale));
        $('#player1AngleText').val(self.model.players[0].angle * (180 / Math.PI));
        $('#player1AngleSlider').val(self.model.players[0].angle * (180 / Math.PI));
      
        
        $('#player2Icon').html('<span class="glyphicon glyphicon-picture" aria-hidden="true"></span>');
        $('#player2ScaleText').val(self.model.players[1].scale);
        $('#player2ScaleSlider').val(calcScaleSliderValue(self.model.players[1].scale));
        $('#player2AngleText').val(self.model.players[1].angle * (180 / Math.PI));
        $('#player2AngleSlider').val(self.model.players[1].angle * (180 / Math.PI));
        
        self.enableElements();
      }
    }
    
    this.preloadTrackModel = function(event) {
      
      var proceed = true;
      
      if (self.model!=null && self.model.edited==true) {
        
        proceed = window.confirm('You\'re loading a new track model.  Any changes made to the current track model will be lost.  Do you want to proceed?');
      }
      
      if (!proceed) {
        
          event.preventDefault();
      }
    }
    
    this.loadTrackModel = function(event) {
      
      var imageURL = document.getElementById('loadTrackModelInput').value;
      var pathElements = imageURL.split('\\');
      var filename = 'Editor\\Models\\' + pathElements[pathElements.length - 1];
      
      var rawFile = new XMLHttpRequest();
      
      rawFile.open("GET", filename, true);
      rawFile.responseType = "text";
      rawFile.onload = function() {
        
        self.loadTrackModelCompleted(rawFile.responseText);
      };
      
      rawFile.send();
      
      return false; // Once async load started, don't let the anchor link to anywhere
    }
    
    this.loadTrackModelCompleted = function(jsonString) {
    
      var loadModel = JSON.parse(jsonString);
      
      // Create new editor model
      self.model = new OverDrive.Editor.EditorModel();
            
      self.model.trackNumber = loadModel.trackNumber;
      $('#trackNumberField').val(self.model.trackNumber);
      
      var imageURL = loadModel.trackImage.imageURL;
      var pathElements = imageURL.split('\\');
      
      OverDrive.Background.Load(self.model.trackImage, imageURL, function(bgnd) {
          
          $('#trackFileNameLabel').html(pathElements[pathElements.length - 1]);
      });
      
      //self.model.regions = [];
      
      for (var i=0; i < loadModel.regions.length; ++i) {
        
        var r = OverDrive.Region.Create();
        
        r.points = loadModel.regions[i].points;
        OverDrive.Region.BuildCollisionModel(r);
        
        self.model.regions.push(r);
      }
      
      OverDrive.Graph.BuildGraph(self.model.regions);
      
      self.model.players = loadModel.players;
      
      // Update player elements
      
      if (self.model.players[0].playerImage != '') {
        
        document.getElementById('player1Icon').innerHTML = '<img src=\'' + self.model.players[0].playerImageURI + '\' ' + 'draggable=\'true\' ' + 'id=\'' + 'player1Draggable' + '\' ' + '/>';
                
        // Setup draggable event handler
        //document.getElementById('player1Draggable').addEventListener('dragstart', self.startDrag);
      }
      
      $('#player1ScaleText').val(self.model.players[0].scale);
      $('#player1ScaleSlider').val(calcScaleSliderValue(self.model.players[0].scale));
      $('#player1AngleText').val(self.model.players[0].angle * (180 / Math.PI));
      $('#player1AngleSlider').val(self.model.players[0].angle * (180 / Math.PI));
        
      if (self.model.players[1].playerImage != '') {
        
        document.getElementById('player2Icon').innerHTML = '<img src=\'' + self.model.players[1].playerImageURI + '\' ' + 'draggable=\'true\' ' + 'id=\'' + 'player2Draggable' + '\' ' + '/>';
                
        // Setup draggable event handler
        //document.getElementById('player2Draggable').addEventListener('dragstart', self.startDrag);
      }
      
      $('#player2ScaleText').val(self.model.players[1].scale);
      $('#player2ScaleSlider').val(calcScaleSliderValue(self.model.players[1].scale));
      $('#player2AngleText').val(self.model.players[1].angle * (180 / Math.PI));
      $('#player2AngleSlider').val(self.model.players[1].angle * (180 / Math.PI));
      
      self.enableElements();
    }
    
    
    this.saveTrack = function(event) {
      
      var filename = prompt('Enter name of track file to save');
      
      if (filename != null) {
        
        filename += '.odt.json';
        
        // Build model of just track region data - ignore editor and derived data
        var saveModel = {
          
          trackNumber : self.model.trackNumber,
          trackImage : self.model.trackImage,
          regions : [],
          players : self.model.players
        };
        
        for (var i=0; i < self.model.regions.length; ++i) {
          
          saveModel.regions.push( { points : self.model.regions[i].points });
        }
        
        var dataString = JSON.stringify(saveModel);
        
        var blob = new Blob([dataString], { type : 'text/plain;charset=utf-8' } );
        var url = URL.createObjectURL(blob, { oneTimeOnly : true } );
        
        var a = event.currentTarget;  
        a.download = filename;
        a.href = url;
        
        self.model.edited = false;
        self.enableElements();
        
        // Return true to allow anchor to proceed with link to url
        return true;
      }
    }
    
    this.deleteTrack = function(event) {
    
      var proceed = true;
      
      if (self.model && self.model.edited==true) {
        
        proceed = window.confirm('Delete track model?');
      }
      
      if (proceed) {
      
        self.model = null;
        
        // Re-initialise DOM
        $('#trackNumberField').val(1);
        $('#trackFileNameLabel').html('(no track image selected)');
        
        $('#player1Icon').html('<span class="glyphicon glyphicon-picture" aria-hidden="true"></span>');
        $('#player1ScaleText').val(1);
        $('#player1ScaleSlider').val(calcScaleSliderValue(1));
        $('#player1AngleText').val(0);
        $('#player1AngleSlider').val(0);
      
        $('#player2Icon').html('<span class="glyphicon glyphicon-picture" aria-hidden="true"></span>');
        $('#player2ScaleText').val(1);
        $('#player2ScaleSlider').val(calcScaleSliderValue(1));
        $('#player2AngleText').val(0);
        $('#player2AngleSlider').val(0);
        
        self.enableElements();
      }
    }
    
    this.testTrack = function(event) {
    
      self.enterTest = true;
    }
    
    this.exportTrack = function(event) {
      
      var filename = prompt('Export track to script file');
      
      if (filename != null) {
        
        filename += '.odt.js';
        
        // Build model of just track region data - ignore editor and derived data
        var saveModel = {
          
          trackNumber : self.model.trackNumber,
          trackImage : self.model.trackImage,
          regions : [],
          players : self.model.players
        };
        
        for (var i=0; i < self.model.regions.length; ++i) {
          
          saveModel.regions.push( { points : self.model.regions[i].points });
        }
        
        var dataString = 'OverDrive.Game.tracks[' + (saveModel.trackNumber-1) + '] = ' + JSON.stringify(saveModel) + ';';
                
        var blob = new Blob([dataString], { type : 'text/plain;charset=utf-8' } );
        var url = URL.createObjectURL(blob, { oneTimeOnly : true } );
        
        var a = event.currentTarget;  
        a.download = filename;
        a.href = url;
                
        // Return true to allow anchor to proceed with link to url
        return true;
      }
    }
    /*this.exportTrack = function(event) {
    
      var filename = prompt('Export track to script file');
      
      if (filename != null) {
        
        filename += '.odt.js';
        
        // Build model of just track region data - ignore editor and derived data
        var saveModel = {
          
          trackNumber : self.model.trackNumber,
          trackImage : self.model.trackImage,
          regions : [],
          players : self.model.players
        };
        
        for (var i=0; i < self.model.regions.length; ++i) {
          
          saveModel.regions.push( {
            
            points : self.model.regions[i].points
          
          } );
        }
        
        // Track model exports to tracks[] array
        var dataString = 'OverDrive.Game.tracks[' + (saveModel.trackNumber-1) + '] = ' + JSON.stringify(saveModel) + ';';
        
        var blob = new Blob([dataString], { type : 'text/plain;charset=utf-8' } );
        var url = URL.createObjectURL(blob, { oneTimeOnly : true } );
          
        // 'Rewire' anchor to link to new blob-based url
        var a = event.currentTarget;
          
        a.download = filename;
        a.href = url;
          
        return true; // Return true to allow anchor to proceed with link to url
      }
    }*/
    
    
    // Track loading handlers
    this.preloadTrack = function(event) {
    
      var proceed = true;
      
      if (self.model.regions.length > 0) {
        
        proceed = window.confirm('You\'re loading a new track picture.  The existing track model may not match.  Do you want to proceed?');
      }
      
      if (!proceed) {
        
          event.preventDefault();
      }
    }
    
    this.loadTrackImage = function() {
    
      var imageURL = $('#loadTrackImageInput').val();
      var pathElements = imageURL.split('\\');
      var filename = 'Assets\\Images\\' + pathElements[pathElements.length - 1];
      
      OverDrive.Background.Load(self.model.trackImage, filename, function(bgnd) {
          
          $('#trackFileNameLabel').html(pathElements[pathElements.length - 1]);
          
          self.model.edited = true;
          self.enableElements();
        }
      );
    }
    
    this.setTrackNumber = function(event) {
      
      self.model.trackNumber = event.currentTarget.value;
      
      self.model.edited = true;
      self.enableElements();
    }
    
    /*
    function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
}
</script>
</head>
<body>

<div id="div1" ondrop="drop(event)" ondragover="allowDrop(event)"></div>

<img id="drag1" src="img_logo.gif" draggable="true"
ondragstart="drag(event)" width="336" height="69">
    */
    
    this.startDrag = function(event) {
    
      console.log('start drag : ' + event.target.id);
      
      event.dataTransfer.setData('text/plain', event.target.id);
    }
    
    this.loadPlayerImage = function(playerIndex, iconHost, fileNameHost) {
      
      var imageURL = fileNameHost.value;
      var pathElements = imageURL.split('\\');        
      var filename = 'Assets\\Images\\' + pathElements[pathElements.length - 1];
      
      var idString = 'player' + playerIndex + 'Draggable';
      
      // Update button content to reference image(use this image as the basis of the sprite in the main editor)
      var elementString = '<img src=\'' + filename + '\' ';
      elementString += 'draggable=\'true\' ';
      elementString += 'id=\'' + idString + '\' ';
      elementString += '/>';
      
      hostElement = iconHost;
      hostElement.innerHTML = elementString;
      
      self.model.players[playerIndex - 1].playerImageURI = filename;
      
      // Setup draggable event handler
      var imgElement = document.getElementById(idString);
      imgElement.addEventListener('dragstart', self.startDrag);
      
      self.model.edited = true;
      self.enableElements();
    }
    
    // Load player 1 image
    this.loadPlayer1Image = function() {
      
      self.loadPlayerImage(1, document.getElementById('player1Icon'), document.getElementById('loadPlayer1ImageInput'));
    }

    // Player 1 placement
    this.startPlayer1Placement = function(event) {
      
      self.currentPlayerPlacement = 1;
      
      // Remove previous placement
      self.model.players[0].inPlace = false;
      
      self.enableElements();
    }
    
    // Delete player 1
    this.deletePlayer1 = function(event) {
      
      var proceed = window.confirm('You\'re about to delete Player 1.  Any changes made to Player 1 will be lost.  Do you want to proceed?');
      
      if (proceed) {
      
        // Remove player 1 from model
        self.model.players[0].playerImageURI = '';
        self.model.players[0].inPlace = false;
        self.model.players[0].pos = { x : 0, y : 0 };
        self.model.players[0].angle = 0;
        self.model.players[0].scale = 1;
        
        // Update DOM
        $('#player1Icon').html('<span class="glyphicon glyphicon-picture" aria-hidden="true"></span>');
        
        $('#player1ScaleText').val(self.model.players[0].scale);
        $('#player1ScaleSlider').val(calcScaleSliderValue(self.model.players[0].scale));
        
        $('#player1AngleText').val(self.model.players[0].angle);
        $('#player1AngleSlider').val(self.model.players[0].angle);
        
        self.model.edited = true;
        self.enableElements();
      }      
    }
    
    // Scale update
    this.updateScaleField = function(slider, textField, playerIndex) {
        
      // Apply (linear) scale transfer function
      
      //const sigma = 2;
      //const range = 20;
      //const maxScale = sigma + 1;
      
      //textField.value = (slider.value <= (range / 2)) ? slider.value / (range / 2) : (slider.value - (range / 2)) / (range - (range / 2)) * sigma + 1;
      
      textField.value = calcScaleFieldValue(slider.value);
      self.model.players[playerIndex - 1].scale = textField.value;
      
      self.model.edited = true;
    }
    
    this.updateScaleSlider = function(textField, slider, playerIndex) {
    
      // Apply inverse (linear) scale transfer function
      
      //const sigma = 2;
      //const range = 20;
      //const maxScale = sigma + 1;
      
      textField.value = Math.min(Math.max(textField.value, 0), maxScale);
     
      slider.value = calcScaleSliderValue(textField.value);
      //slider.value = (textField.value <= 1) ? textField.value * (range / 2) : ((textField.value -  1) / sigma) * (range - (range / 2)) + (range / 2);
      
      self.model.players[playerIndex - 1].scale = textField.value;
      
      self.model.edited = true;
    }
    
    this.updatePlayer1ScaleText = function() {
      
      self.updateScaleField(document.getElementById('player1ScaleSlider'), document.getElementById('player1ScaleText'), 1);
    }
    
    this.updatePlayer1ScaleSlider = function() {
      
      self.updateScaleSlider(document.getElementById('player1ScaleText'), document.getElementById('player1ScaleSlider'), 1);
    }
    
    // Angle update (player 1)
    this.updatePlayer1AngleText = function() {
      
      var theta = $('#player1AngleSlider').val();
      $('#player1AngleText').val(theta);
      self.model.players[0].angle = theta * (Math.PI / 180);
      
      self.model.edited = true;
    }
    
    this.updatePlayer1AngleSlider = function() {
      
      var textField = $('#player1AngleText');
      
      var theta = Math.min(359, Math.max(0, textField.val()));
      textField.val(theta);
      $('#player1AngleSlider').val(theta);
      
      self.model.players[0].angle = theta * (Math.PI / 180);   

      self.model.edited = true;      
    }
    
    // Load player 2 image
    this.loadPlayer2Image = function() {
      
      self.loadPlayerImage(2, document.getElementById('player2Icon'), document.getElementById('loadPlayer2ImageInput'));
    }
    
    // Player 2 placement
    this.startPlayer2Placement = function(event) {
      
      self.currentPlayerPlacement = 2;
      
      // Remove previous placement
      self.model.players[1].inPlace = false;
      
      self.enableElements();
    }
    
    // Delete player 2
    this.deletePlayer2 = function(event) {
      
      var proceed = window.confirm('You\'re about to delete Player 2.  Any changes made to Player 2 will be lost.  Do you want to proceed?');
      
      if (proceed) {
      
        // Remove player 2 from model
        self.model.players[1].playerImageURI = '';
        self.model.players[1].inPlace = false;
        self.model.players[1].pos = { x : 0, y : 0 };
        self.model.players[1].angle = 0;
        self.model.players[1].scale = 1;
        
        // Update DOM
        $('#player2Icon').html('<span class="glyphicon glyphicon-picture" aria-hidden="true"></span>');
        
        $('#player2ScaleText').val(self.model.players[1].scale);
        $('#player2ScaleSlider').val(self.calcScaleSliderValue(self.model.players[1].scale));
        
        $('#player2AngleText').val(self.model.players[1].angle);
        $('#player2AngleSlider').val(self.model.players[1].angle);
        
        self.model.edited = true;
        self.enableElements();
      }      
    }
    
    // Scale update (player 2)    
    this.updatePlayer2ScaleText = function() {
      
      self.updateScaleField(document.getElementById('player2ScaleSlider'), document.getElementById('player2ScaleText'), 2);
    }
    
    this.updatePlayer2ScaleSlider = function() {
      
      self.updateScaleSlider(document.getElementById('player2ScaleText'), document.getElementById('player2ScaleSlider'), 2);
    }
    
    // Angle update (player 2)
    this.updatePlayer2AngleText = function() {
      
      var theta = $('#player2AngleSlider').val();
      $('#player2AngleText').val(theta);
      self.model.players[1].angle = theta * (Math.PI / 180);
      
      self.model.edited = true;
    }
    
    this.updatePlayer2AngleSlider = function() {
      
      var textField = $('#player2AngleText');
      
      var theta = Math.min(359, Math.max(0, textField.val()));
      textField.val(theta);
      $('#player2AngleSlider').val(theta);
      self.model.players[1].angle = theta * (Math.PI / 180);

      self.model.edited = true;
    }
    
    
    //
    // Mouse event handlers
    //
    
    this.getNormalisedMouseCoords = function(event) {
    
      var rect = canvas.getBoundingClientRect();
  
      return {
    
        x : (event.clientX - rect.left) / (rect.right - rect.left),
        y : (event.clientY - rect.top) / (rect.bottom - rect.top)
      };
    }
    
    this.mouseDown = function(event) {
    
      self.currentMousePos = self.getNormalisedMouseCoords(event);
      
      // Only allow interaction if canBuildTrack is true
      if (canEditTrack(self)) {

        // First check if we're in player placement mode
        if (self.currentPlayerPlacement > 0) {
          
          // Validate placement                      
          if (Matter.Vertices.contains(self.model.regions[0].collisionModel.vertices, self.currentMousePos)) {
            
            // Setup placement
            self.model.players[self.currentPlayerPlacement - 1].inPlace = true;
            self.model.players[self.currentPlayerPlacement - 1].pos = self.currentMousePos;
            
            // Exit player placement mode
            self.currentPlayerPlacement = 0;
            
            // Model updated - modify interface elements
            self.model.edited = true;
            self.enableElements();
          }
          
        } else {
          
          // Manage interaction with the graph
          
          self.proximityList = OverDrive.Proximity.GetPointsInProximity(self.currentMousePos, self.model.regions, self.newRegion, self.proximityThreshold);
        
          if (self.newRegion == null) {
            
            // Check if we've intersected any player to start player placement process
            
            // Check if ctrl key is pressed - if so we're going to move existing points
            if (event.ctrlKey) {
            
              if (self.proximityList.points.length > 0) {
              
                // Build list of static points not in proximityList
                self.pStatic = OverDrive.Proximity.GetDisjointPointSet(self.proximityList, self.model.regions);
                
                self.moveVertices = true;
              }
            }
            else {
              
              // Start tracing new region
            
              self.newRegion = OverDrive.Region.Create();
                        
              if (self.proximityList.points.length > 0) {
              
                self.newRegion.points.push(self.proximityList.points[0].coord);
              }
              else {
              
                self.newRegion.points.push(self.currentMousePos);
              }
            }
          }
          else {
          
            // Continue tracing existing region
            
            if (self.proximityList.numPoints() > 0) {
            
              if (self.proximityList.closeLoopPoint != null) {
              
                // Finished current region - build vertex model for ordering and convex tests
                OverDrive.Region.BuildCollisionModel(self.newRegion);

                // Augment graph for existing regions with newRegion
                OverDrive.Graph.AugmentGraph(self.model.regions, self.newRegion);

                // Store new region - don't store closeLoopPoint (again) since this is the first point of the new region!
                self.model.regions.push(self.newRegion);                
                self.newRegion = null;
                
                // Model updated - modify interface elements
                self.model.edited = true;
                self.enableElements();
              
                // Update interface state based on update to region model state
                /*if (document.getElementById('player1Draggable')) {
                  
                  document.getElementById('player1PlaceButton').disabled = false;
                }
                
                if (document.getElementById('player2Draggable')) {
                  
                  document.getElementById('player2PlaceButton').disabled = false;
                }*/
              }
              else {
              
                // Check if any other point on any other region is in proximity
                // Note: We ignore the current new region - we cannot intersect points on the same region!
                if (self.proximityList.points.length > 0) {
                
                  // Map to first point (ideally closest point ***)
                  self.newRegion.points.push(self.proximityList.points[0].coord);
                }
              }
            }
            else {
            
              // No points in close proximity so simply add current point to newRegion
              self.newRegion.points.push(self.currentMousePos);
            }
          }
        }
      }
    }
    
    this.mouseUp = function(event) {
      
      if (canEditTrack(self)) {
        
        if (self.moveVertices) {
       
          // Align vertices and rebuild graph
          
          // For each vertex in moveVertices proximity list (the dynamic list - D),
          // check against other vertices for alignment
          
          let D = self.proximityList.points;
          
          for (var i=0; i < D.length; ++i) {
          
            var S = OverDrive.Proximity.GetStaticPointsInProximity(D[i].coord, self.pStatic, self.proximityThreshold);
            
            if (S.length > 0) {
            
              let minDistPoint = null;
              let minDist = 0;
              
              for (var j=0; j < S.length; ++j) {
              
                // We want to ignore any points in S that appear in D
                // Those points in S which remain are distance checked to Pi
                // Pi is then set to the closest point.
                // In addition, we want to ignore points on the same region as Pi -
                // this enforces the rule where same region points can't directly overlap.

                if (S[j].regionIndex != D[i].regionIndex) {
                
                  if (minDistPoint==null) {
                  
                    minDistPoint = S[j];
                    minDist = OverDrive.Proximity.SqrCanvasDist(S[j].coord, D[i].coord);
                  }
                  else {
                  
                    let dist = OverDrive.Proximity.SqrCanvasDist(S[j].coord, D[i].coord);
                    
                    if (dist < minDist) {
                    
                      minDistPoint = S[j];
                      minDist = dist;
                    }
                  }
                }
              }
              
              if (minDistPoint != null) {
            
                //console.log('move to point ' + minDistPoint.pointIndex + ' in region ' + minDistPoint.regionIndex);
                
                D[i].coord.x = minDistPoint.coord.x;
                D[i].coord.y = minDistPoint.coord.y;
              }
            }
          }
          
          // Rebuild collision model
          for (var i=0; i < self.model.regions.length; ++i) {
          
            OverDrive.Region.BuildCollisionModel(self.model.regions[i]);
          }
          
          // Reconstruct graph
          OverDrive.Graph.BuildGraph(self.model.regions);//buildGraph(regions);
          
          self.pStatic = null;
          self.moveVertices = false;
          
          // Model updated - modify interface elements
          self.model.edited = true;
          self.enableElements();
        }
      }
    }
    
    this.mouseMove = function(event) {
      
      self.currentMousePos = self.getNormalisedMouseCoords(event);
      
      if (canEditTrack(self)) {
      
        if (self.moveVertices) {
        
          // Move group of vertices captured on mousedown
          for (var i=0; i<self.proximityList.points.length; ++i) {
          
            self.proximityList.points[i].coord.x = self.currentMousePos.x;
            self.proximityList.points[i].coord.y = self.currentMousePos.y;
          }
        }
        else {
        
          self.proximityList = OverDrive.Proximity.GetPointsInProximity(self.currentMousePos, self.model.regions, self.newRegion, self.proximityThreshold);
        }
      }
    }
    
    this.mouseEnter = function(event) {
    
      self.mouseInCanvas = true;
      
      self.currentMousePos = self.getNormalisedMouseCoords(event);
      
      if (canEditTrack(self)) {
      
        self.proximityList = OverDrive.Proximity.GetPointsInProximity(self.currentMousePos, self.model.regions, self.newRegion, self.proximityThreshold);
      }
    }
    
    this.mouseLeave = function(event) {
    
      self.mouseInCanvas = false;
    }
    
    // Keyboard event handlers
    this.keyDown = function(event) {
    
      const Keys = { DEL : 46, ESC : 27 };
            
      switch (event.keyCode) {
        
        case Keys.DEL: {
          
          if (canEditTrack(self) && !self.moveVertices) {
          
            // Only process if we're not dragging existing vertices around
            if (self.newRegion) {
            
              // If we're currently building a new region, dispose of it
              self.newRegion = null;
            }
            else {
            
              if (self.model.regions.length > 0) {
              
                // If not new region is being created, remove the last region added
                self.model.regions.pop();
                
                // Reconstruct graph
                OverDrive.Graph.BuildGraph(self.model.regions);
                
                // Model updated - modify interface elements
                self.model.edited = true;
                self.enableElements();
              }
            }
            
            // Rebuild proximity point list
            self.proximityList = OverDrive.Proximity.GetPointsInProximity(self.currentMousePos, self.model.regions, self.newRegion, self.proximityThreshold);
          }
      
          break;
        }
        
        case Keys.ESC: {
          
          // Cancel player placement
          if (self.currentPlayerPlacement > 0) {
            
            self.currentPlayerPlacement = 0;
          }
          break;
        }
      }
      
    }
      
  };
  
  return stage;
  
})((OverDrive.EditorStage || {}), OverDrive.canvas, OverDrive.context);


OverDrive.EditorStage = (function(stage, canvas, context) {
  
  stage.Editor.prototype.enableElements = function() {
    
    var map = this.elementActivationMap;
    
    Object.keys(map).forEach(function(key) { map[key](this); }, this);
  }
  
  return stage;
  
})((OverDrive.EditorStage || {}), OverDrive.canvas, OverDrive.context);



