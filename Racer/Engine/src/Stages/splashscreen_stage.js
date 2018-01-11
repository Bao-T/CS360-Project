

OverDrive.Stages.SplashScreen = (function(stage, canvas, context) {
  
  // Private API
  
  let overdrive = OverDrive.Game.system;
  
  let splashScreen = 'Assets/Images/splashscreen.png';
  let appearTime = 1; // time in seconds
  let disappearTime = 2; // time in seconds
  
  
  //
  // Public interface
  //
  
  // Factory method
  
  stage.Create = function() {
    
    return new stage.SplashScreen();
  }
  
  
  stage.SplashScreen = function() {
        
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

    
    // Stage specific variables
    this.backgroundImage = null;
    this.timeElapsed = 0;
    this.keyDown = null;
    
    
    //
    // Stage interface implementation
    //
    
    // Pre-start stage with relevant parameters
    // Not called for initial state!
    this.preTransition = function(params) {}
    
    
    this.init = function() {
      
      self.backgroundImage = new OverDrive.Game.Background(splashScreen);
      
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
      
      overdrive.gameClock.tick();
      
      self.timeElapsed += overdrive.gameClock.convertTimeIntervalToSeconds(overdrive.gameClock.deltaTime);
      
      context.globalAlpha = self.timeElapsed / appearTime;
      
      if (self.backgroundImage) {
    
        self.backgroundImage.draw();
      }
      
      if (self.timeElapsed < appearTime) {
        
        window.requestAnimationFrame(self.phaseInLoop);
      }
      else {
        
        // Stop clock and proceed to main loop
        overdrive.gameClock.stop();
        window.requestAnimationFrame(self.mainLoop);
      }
    }
    
    this.mainLoop = function() {
            
      if (self.keyPressed()) {
        
        window.requestAnimationFrame(self.initPhaseOut);
      }
      else {
        
        window.requestAnimationFrame(self.mainLoop);
      }
    }
    
    this.initPhaseOut = function() {
      
      // Reset time elapsed counter and restart clock
      self.timeElapsed = 0;
      overdrive.gameClock.start();
      
      window.requestAnimationFrame(self.phaseOutLoop);
    }
    
    this.phaseOutLoop = function() {
      
      overdrive.gameClock.tick();
      
      self.timeElapsed += overdrive.gameClock.convertTimeIntervalToSeconds(overdrive.gameClock.deltaTime);
      
      context.globalAlpha = 1 - (self.timeElapsed / disappearTime);
      
      if (self.backgroundImage) {
    
        self.backgroundImage.draw();
      }
      
      if (self.timeElapsed < disappearTime) {
        
        window.requestAnimationFrame(self.phaseOutLoop);
      }
      else {
        
        window.requestAnimationFrame(self.leaveStage);
      }
    }
    
    this.leaveStage = function() {
          
      // Tear down stage
      $(document).off('keydown');
      $(document).off('keyup');
            
      context.globalAlpha = 1;
      
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
    
    
    // Event handlers for current stage
    
    this.onKeyDown = function(event) {
      
      self.keyDown[event.keyCode] = true;
    }
    
    this.onKeyUp = function(event) {
      
      self.keyDown[event.keyCode] = false;
    }
    
    // Return true if any key is pressed at the time the function is called
    this.keyPressed = function() {
      
      var isPressed = false;
      
      for (var i=0; i<256 && !isPressed; ++i) {
          
        isPressed = this.keyDown[i];
      }
      
      return isPressed;
    }
    
  };
  
  
  return stage;
  
})((OverDrive.Stages.SplashScreen || {}), OverDrive.canvas, OverDrive.context);



