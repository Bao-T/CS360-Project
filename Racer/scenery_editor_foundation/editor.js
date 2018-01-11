
//
// OverDrive scenery model editor
//

OverDrive.EditorStage = (function(stage, canvas, context) {
  
  // Factory method
  stage.Create = function() {
    
    var editor = new stage.Editor();
    
    // For each identified element, evaluate the given lambda, passing the host environment (typically the editor state) to enable / disable the given element and return true if the element can be enabled, false otherwise.  The lambda performs the actual enable / disable operation since different elements may have different means of activation (Bootstrap navbar for example).  Items can be added and removed from the array as the interface / editor model changes.  This code adresses the default set of controls provided by the interface.
    
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
    
    return editor;
  }
  
  return stage;
  
})((OverDrive.EditorStage || {}), OverDrive.canvas, OverDrive.context);


OverDrive.EditorStage = (function(stage, canvas, context) {
  
  //
  // Private API
  //
  
  var canEditScenery = function(env) {
    
    return (env.model && env.model.trackImage && env.model.trackImage.loaded);
  }
  
  
  //
  // Public API
  //
  
  // Constructor
  stage.Editor = function() {
    
    var self = this;
    
    this.transitionLinks = {
    };
    
    this.setTransition = function(id, target) {
      
      this.transitionLinks[id] = target;
    }
          
    this.model = null;
    
    this.newRegion = null;
        
    // Track existing region vertices in proximity to mouse cursor
    this.proximityThreshold = 20; // 20 pixel radius
    this.proximityList = null;
    
    // Disjoint list of points {coord, region index, point index} from regions not in proximityList
    this.pStatic = null;
    
    this.moveVertices = false;
    
    this.mouseInCanvas = true;
    this.currentMousePos = { x : 0, y : 0 };    
    
    this.bootstrapEditor = true;
    
    // Exit transition state (picked up by leaveStage)
    this.leaveState = {
      
      id : null,
      params : null
    };
    
    
    this.render = function() {
     
      OverDrive.Background.Render(this.model.trackImage);

      // Draw previous regions (closed loops)
      var regionFillColour = '#00F';
      
      for (var i=0; i< this.model.regions.length; ++i) {
      
        OverDrive.Region.Render(this.model.regions[i], true, regionFillColour);
      }
      
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
          
            // Now, if <=2 points (including inital close-loop point) are defined in newRegion we cannot close the loop, so show this in red, otherwise show this in green
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
    
        // No new region is being defined, so mouse cursor is moving 'freely'.  Look for any point in previously defined regions and render according to proximity
      
        if (this.proximityList != null) {
      
          context.fillStyle = '#0F0';
          
          for (var i=0; i<this.proximityList.points.length; ++i) {
          
            context.beginPath();
            context.arc(this.proximityList.points[i].coord.x * canvas.width, this.proximityList.points[i].coord.y * canvas.height, 5, 0, 2 * Math.PI);
            context.fill();
          }
        }
        
        // If we're dragging vertices, look for proximity to static points and render target accordingly.
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
    
    
    //
    // Event handlers
    //
    
    // Navbar event handlers
    
    this.newScenery = function(event) {
      
      var proceed = true;
      
      if (self.model && self.model.edited==true) {
        
        proceed = window.confirm('You\'re creating a new scenery model.  Any changes made to the current scenery will be lost.  Do you want to proceed?');
      }
      
      if (proceed) {
      
        // Create new model
        self.model = new OverDrive.Editor.EditorModel();
        
        // Reset interface
        $('#trackNumberField').val(self.model.trackNumber);
        $('#trackFileNameLabel').html('(No track image selected)');
        
        self.enableElements();
      }
    }
    
    this.preloadSceneryModel = function(event) {
      
      var proceed = true;
      
      if (self.model && self.model.edited==true) {
        
        proceed = window.confirm('You\'re loading a new scenery model.  Any changes made to the current scenery will be lost.  Do you want to proceed?');
      }
      
      if (!proceed) {
        
        event.preventDefault();
      }
    }
    
    this.loadSceneryModel = function(event) {
    
      // Check we don't have an existing model
      var imageURL = $('#loadSceneryModelInput').val();
      var pathElements = imageURL.split('\\');
      var filename = 'Editor\\Models\\' + pathElements[pathElements.length - 1];
      
      var rawFile = new XMLHttpRequest();
      
      rawFile.open("GET", filename, true);
      rawFile.responseType = "text";
      rawFile.onload = function() {
        
        self.loadSceneryModelCompleted(rawFile.responseText);
      };
      
      rawFile.send();
      
      return false; // Once async load started, don't let the anchor link to anywhere
    }
    
    // Callback to setup new scenery model from loaded json
    this.loadSceneryModelCompleted = function(jsonString) {
    
      // Create model based on JSON
      var loadModel = JSON.parse(jsonString);

      // Create new editor model
      self.model = new OverDrive.Editor.EditorModel();
      
      // Deconstruct loaded model and setup editor
      self.model.trackNumber = loadModel.trackNumber;
      $('#trackNumberField').val(self.model.trackNumber);
      
      var imageURL = loadModel.trackImage.imageURL;
      var pathElements = imageURL.split('\\');
      
      OverDrive.Background.Load(self.model.trackImage, imageURL, function(bgnd) {
        
        $('#trackFileNameLabel').html(pathElements[pathElements.length - 1]);
      });
      
      self.model.regions = [];
      
      for (var i=0; i < loadModel.regions.length; ++i) {
        
        var r = OverDrive.Region.Create();
        
        r.points = loadModel.regions[i].points;
        OverDrive.Region.BuildCollisionModel(r);
        
        self.model.regions.push(r);
      }
      
      self.enableElements();
    }
    
    this.saveScenery = function(event) {
      
      var filename = prompt('Enter name of scenery file to save');
      
      if (filename != null) {
        
        filename += '.od_scenery.json';
        
        // Build model of just track region data - ignore editor and derived data
        var saveModel = {
          
          trackNumber : self.model.trackNumber,
          trackImage : self.model.trackImage,
          regions : []
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

    this.exportScenery = function(event) {
    
      var filename = prompt('Export track to script file');
      
      if (filename != null) {
        
        filename += '.od_scenery.js';
        
        // Build model of just track region data - ignore editor and derived data
        var saveModel = {
          
          trackNumber : self.model.trackNumber,
          trackImage : self.model.trackImage,
          regions : []
        };
        
        for (var i=0; i < self.model.regions.length; ++i) {
          
          saveModel.regions.push( {
            
            points : self.model.regions[i].points
          
          } );
        }
        
        // Track model exports to tracks[] array
        var dataString = 'OverDrive.Game.scenery[' + (saveModel.trackNumber-1) + '] = ' + JSON.stringify(saveModel) + ';';
        
        var blob = new Blob([dataString], { type : 'text/plain;charset=utf-8' } );
        var url = URL.createObjectURL(blob, { oneTimeOnly : true } );
        
        var a = event.currentTarget;
        a.download = filename;
        a.href = url;
        
        // Return true to allow anchor to proceed with link to url
        return true;
      }
    }
    
    
    // Track image loading handlers
    
    this.preloadTrackImage = function(event) {
    
      var proceed = true;
      
      if (self.model.regions.length > 0) {
        
        proceed = window.confirm('You\'re loading a new track picture.  The existing scenery model may not match.  Do you want to proceed?');
      }
      
      if (!proceed) {
        
        event.preventDefault();
      }
    }
    
    this.loadTrackImage = function(event) {
      
      var imageURL = $('#loadTrackImageInput').val();
      var pathElements = imageURL.split('\\');
      var filename = 'Assets\\Images\\' + pathElements[pathElements.length - 1];
      
      OverDrive.Background.Load(self.model.trackImage, filename, function(bgnd) {
          
        $('#trackFileNameLabel').html(pathElements[pathElements.length - 1]);
        
        self.model.edited = true;
        self.enableElements();
      });
    }
    
    this.setTrackNumber = function(event) {
      
      self.model.trackNumber = event.currentTarget.value;
      
      // Model updated - modify interface elements
      self.model.edited = true;
      self.enableElements();
    }
    
    
    // Mouse event handlers
    
    this.getNormalisedMouseCoords = function(event) {
    
      var rect = canvas.getBoundingClientRect();
  
      return {
    
        x : (event.clientX - rect.left) / (rect.right - rect.left),
        y : (event.clientY - rect.top) / (rect.bottom - rect.top)
      };
    }
    
    this.mouseDown = function(event) {
    
      self.currentMousePos = self.getNormalisedMouseCoords(event);
      
      if (canEditScenery(self)) {

        self.proximityList = OverDrive.Proximity.GetPointsInProximity(self.currentMousePos, self.model.regions, self.newRegion, self.proximityThreshold);
      
        if (self.newRegion == null) {
          
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
              
              // Store new region - don't store closeLoopPoint (again) since this is the first point of the new region!
              self.model.regions.push(self.newRegion);
              self.newRegion = null;
              
              // Model updated - modify interface elements
              self.model.edited = true;
              self.enableElements();
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
    
    this.mouseUp = function(event) {
      
      if (canEditScenery(self) && self.moveVertices) {
        
        // Align vertices - For each vertex in moveVertices proximity list (the dynamic list - D), check against other vertices for alignment
        
        let D = self.proximityList.points;
        
        for (var i=0; i < D.length; ++i) {
        
          var S = OverDrive.Proximity.GetStaticPointsInProximity(D[i].coord, self.pStatic, self.proximityThreshold);
          
          if (S.length > 0) {
          
            let minDistPoint = null;
            let minDist = 0;
            
            for (var j=0; j < S.length; ++j) {
            
              // We want to ignore any points in S that appear in D.  Those points in S which remain are distance checked to Pi where Pi is then set to the closest point.  In addition, we want to ignore points on the same region as Pi - this enforces the rule where same region points can't directly overlap.

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
              
              D[i].coord.x = minDistPoint.coord.x;
              D[i].coord.y = minDistPoint.coord.y;
            }
          }
        }
        
        // Rebuild collision model
        for (var i=0; i < self.model.regions.length; ++i) {
        
          OverDrive.Region.BuildCollisionModel(self.model.regions[i]);
        }
        
        self.pStatic = null;
        self.moveVertices = false;
        
        // Model updated - modify interface elements
        self.model.edited = true;
        self.enableElements();
      }
    }
    
    this.mouseMove = function(event) {
      
      self.currentMousePos = self.getNormalisedMouseCoords(event);
      
      if (canEditScenery(self)) {
      
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
      
      if (canEditScenery(self)) {
      
        self.proximityList = OverDrive.Proximity.GetPointsInProximity(self.currentMousePos, self.model.regions, self.newRegion, self.proximityThreshold);
      }
    }
    
    this.mouseLeave = function(event) {
    
      self.mouseInCanvas = false;
    }
    
    
    // Keyboard event handlers
    
    this.keyDown = function(event) {
    
      const Keys = { DEL : 46 };
      
      switch (event.keyCode) {
        
        case Keys.DEL: {
          
          if (canEditScenery(self) && !self.moveVertices) {
          
            // Only process if we're not dragging existing vertices around
            if (self.newRegion) {
            
              // If we're currently building a new region, dispose of it
              self.newRegion = null;
            }
            else {
            
              if (self.model.regions.length > 0) {
              
                // If not new region is being created, remove the last region added
                self.model.regions.pop();
                
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
