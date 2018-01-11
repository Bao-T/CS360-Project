

OverDrive.Stages.Credits = (function(stage, canvas, context) {
  
  // Private API
  
  let overdrive = OverDrive.Game.system;
  
  var creditFont = '30pt Amatic SC';
  
  var credits = [
  
    'The Wonky Donkey Crew',
    '---------------------',
    'Jade',
    'Hayley',
    'Nick',
    'Owen',
    'Paul',
    'Joshua',
    'Beth',
    'Will',
    'Megan',
    'Hollie',
    'Bethan',
    'Anna',
    
    ' ',
    
    'Erin',
    'Lewis',
    'Tegan',
    'Krystal',
    'Kye',
    'Maisie',
    'Alisha',
    'Leon',
    'Ben',
    'Finley',
    'Charlie',
    'Joshua',
    'Connor',
    'Jenna',
    'Mason',
    'Tia',
    'Joey',
    'Lowrie',
    'Kory',
    'Bethan',
    'Nicky',
    'Jack',
    'Chole',
    'Madison',
    'Amba',
    'Delyth',
    'Laila',
    'Livvi'
	];
  
  
  //
  // Public interface
  //
  
  // Factory method
  
  stage.Create = function() {
    
    return new stage.CreditsStage();
  }
  
  stage.CreditsStage = function() {
    
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
    this.exitCredits = false;
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
      self.exitCredits = false;
      
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
        
        self.exitCredits = true;
      }
      
      // Repeat until exit condition met
      if (!self.exitCredits) {
      
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
      context.font = creditFont;
      
      var textY = self.baseY;
      
      // Centre-aligned text
      for (var i=0; i < credits.length; ++i) {
        
        var textMetrics = context.measureText(credits[i]);
        context.fillText(credits[i], (canvas.width / 2) - (textMetrics.width / 2), textY);
        
        textY += 50;
      }
    }
    
  };
  
  
  return stage;
  
})((OverDrive.Stages.Credits || {}), OverDrive.canvas, OverDrive.context);

