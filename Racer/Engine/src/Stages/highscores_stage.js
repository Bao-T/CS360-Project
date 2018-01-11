

OverDrive.Stages.Leaderboard = (function(stage, canvas, context) {
  
  // Private API
  
  let overdrive = OverDrive.Game.system;
  
  var leaderboardFont = '30pt Amatic SC';
  
  
  //
  // Public interface
  //
  
  // Factory method
  
  stage.Create = function() {
    
    return new stage.LeaderboardStage();
  }
  
  stage.LeaderboardStage = function() {
    
    var self = this;
  
    this.transitionLinks = {
      
      mainMenu : null
    };
    
    this.setTransition = function(id, target) {
      
      self.transitionLinks[id] = target;
    }
    
    // Exit transition state (picked up by leaveStage)
    this.leaveState = {
      
      id : null,
      params : null
    };

    
    // Main game-state specific variables
    this.backgroundImage = null;
    this.baseY = 600;
    this.exitLeaderboard = false;
    this.keyDown = null;
    

    //
    // Stage interface implementation
    //
    
    // Pre-start stage with relevant parameters
    // Not called for initial state!
    this.preTransition = function(params) {
      
      this.backgroundImage = params.backgroundImage;
    }
    
    this.init = function() {
      
      self.baseY = 600;
      self.exitLeaderboard = false;
      
      if (self.keyDown === null) {
      
        self.keyDown = new Array(256);
      }
      
      for (var i=0; i<256; ++i) {
          
        self.keyDown[i] = false;
      }
      
      $(document).on('keyup', self.onKeyUp);
      $(document).on('keydown', self.onKeyDown);
      
      
      window.requestAnimationFrame(self.phaseInLoop);
    }
    
    this.phaseInLoop = function() {
      
      window.requestAnimationFrame(self.mainLoop);
    }	
    
    this.mainLoop = function() {
            
      // Update system clock
      overdrive.gameClock.tick();
      
      self.draw();
      
      self.baseY -= 50 * overdrive.gameClock.convertTimeIntervalToSeconds(overdrive.gameClock.deltaTime);
      
      if (self.keyPressed('ESC')) {
        
        self.exitLeaderboard = true;
      }
      
      // Repeat until exit condition met
      if (!self.exitLeaderboard) {
      
        window.requestAnimationFrame(self.mainLoop);
      }
      else {
      
        window.requestAnimationFrame(self.initPhaseOut);
      }
    }
    
    this.initPhaseOut = function() {
      
      window.requestAnimationFrame(self.phaseOutLoop);
    }
    
    this.phaseOutLoop = function() {
      
      window.requestAnimationFrame(self.leaveStage);
    }
    
    this.leaveStage = function() {
    
      // Tear down stage
      $(document).off('keydown');
      $(document).off('keyup');
      
      // Setup leave state parameters and target - this is explicit!
      self.leaveState.id = 'mainMenu';
      self.leaveState.params = {}; // params setup as required by target state
      
      var target = self.transitionLinks[self.leaveState.id];
      
      // Handle pre-transition (in target, not here! - encapsulation!)
      target.preTransition(self.leaveState.params);

      // Final transition from current stage
      window.requestAnimationFrame(target.init);
      
      // Clear leave state once done
      self.leaveState.id = null;
      self.leaveState.params = null;
    }
    
    
    // Event handlers
    
    this.onKeyDown = function(event) {
      
      self.keyDown[event.keyCode] = true;
    }
    
    this.onKeyUp = function(event) {
      
      self.keyDown[event.keyCode] = false;
    }
    
    
    // Stage processing functions
    
    this.keyPressed = function(keyCode) {
    
      return this.keyDown[overdrive.Keys[keyCode]];
    }
    
    this.draw = function() {

      // Draw background        
      if (self.backgroundImage) {
        
        context.globalAlpha = 0.4;
        self.backgroundImage.draw();
      }
      
      context.globalAlpha = 1;
      context.fillStyle = '#FFF';
      context.font = leaderboardFont;
      
      var textY = self.baseY;
      
      var textMetrics = context.measureText('Leaderboard');
      context.fillText('Leaderboard', (canvas.width / 2) - (textMetrics.width / 2), textY);
      textY += 50;
      
      textMetrics = context.measureText('-----------');
      context.fillText('-----------', (canvas.width / 2) - (textMetrics.width / 2), textY);
      textY += 50;
      
      textMetrics = context.measureText('   ');
      context.fillText('   ', (canvas.width / 2) - (textMetrics.width / 2), textY);
      textY += 50;
        
      // Centre-aligned text
      for (var i=0; i < overdrive.scores.length; ++i) {
        
        var txt = overdrive.scores[i].name + "     " + overdrive.scores[i].score;
        var textMetrics = context.measureText(txt);
        context.fillText(txt, (canvas.width / 2) - (textMetrics.width / 2), textY);
        
        textY += 50;
      }
    }
    
  };
  
  
  return stage;
  
})((OverDrive.Stages.Leaderboard || {}), OverDrive.canvas, OverDrive.context);

