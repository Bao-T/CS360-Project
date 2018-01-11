
// Pre-start stage where players get to press 'go' on their chosen method of control

OverDrive.Stages.InputConfirm = (function(stage, canvas, context) {
  
  // Private API
  let overdrive = OverDrive.Game.system;
  
  
  // Public Interface
  
  stage.Create = function() {
  
    return new stage.InputConfirmStage;
  }
  
  stage.InputConfirmStage = function() {
    
    var self = this;
  
    this.transitionLinks = {
      
      mainGame : null,
      mainMenu : null // Allow option to go back to main menu and change settings
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
    this.player1Selected = false;
    this.player2Selected = false;
    this.returnToMainMenu = false;
    this.keyDown = null;

    this.player1Message = null;
    this.player2Message = null;

    
    
    //
    // Stage interface implementation
    //
    
    // Pre-start stage with relevant parameters
    // Not called for initial state!
    this.preTransition = function(params) {
      
      this.backgroundImage = params.backgroundImage;
    }
    
    this.init = function() {
      
      console.log('Input confirm pre-start screen');
      
      if (self.keyDown === null) {
      
        self.keyDown = new Array(256);
      }
      
      for (var i=0; i<256; ++i) {
          
        self.keyDown[i] = false;
      }
      
      $(document).on('keyup', self.onKeyUp);
      $(document).on('keydown', self.onKeyDown);
      
      
      // Create 'back to menu' button
      var returnToMenuButton = document.createElement('button');
      returnToMenuButton.setAttribute('type', 'button');
      returnToMenuButton.setAttribute('class', 'btn btn-default settingsField');
      returnToMenuButton.setAttribute('id', 'returnToMenuButton');
      returnToMenuButton.appendChild(document.createTextNode('Back to Main Menu'));
      document.getElementById('GameDiv').appendChild(returnToMenuButton);
      $('#returnToMenuButton').click(self.goBackToMenu);
      
            
      // This stage works a little different from the others - we can explicitly setup each sub-stage to handle to player confirmation sequence.  This is the advantage of this approach.
      
      self.returnToMainMenu = false;
      
      // Set both to false at start of stage
      self.player1Selected = false;
      self.player2Selected = false;
      
      overdrive.Gamepad.clearBindings();
      
      window.requestAnimationFrame(self.player1PreConfirm);
    }
    
    
    // Called prior to allowing player 1 to confirm input
    this.player1PreConfirm = function() {
      
      // Establish message text for player1 - this is done once (mainly for gamepads) to avoid multiple messages popping up due to gamepad plug-in, activation on webpage and selection as seperate processes.
      
      // Note: player1Selected comes into play here - if true we're actually re-selecting due to a gamepad being unplugged, so set message accordingly (UNUSED FOR NOW)
      
      player1Message = [];
      
      if (overdrive.settings.players[0].mode==OverDrive.Game.InputMode.Keyboard) {
        
        player1Message.push(overdrive.settings.players[0].name + ' - Press the Accelerate key to start');
      }
      else if (overdrive.settings.players[0].mode==OverDrive.Game.InputMode.Gamepad) {
        
        let gamepads = overdrive.Gamepad.getUnboundGamepadArray();
        
        if (gamepads.length > 0) {
        
          player1Message.push(overdrive.settings.players[0].name + ' - Press any button on your gamepad to start!');
        }
        else {
          
          player1Message.push(overdrive.settings.players[0].name + ' - Plug in a controller...');
          player1Message.push('...and press any button to start!');
        }
      }

      // Set to false before entering main selection / confirmation loop
      self.player1Selected = false;
      
      window.requestAnimationFrame(self.player1Confirm);
    }
    
    
    this.player1Confirm = function() {
      
      self.draw(player1Message);
      
      
      if (overdrive.settings.players[0].mode==OverDrive.Game.InputMode.Keyboard) {
        
        if (self.keyPressed(overdrive.settings.players[0].keys.forward)) {
          
          self.player1Selected = true;
        }
      }
      else if (overdrive.settings.players[0].mode==OverDrive.Game.InputMode.Gamepad) {
        
        let gamepads = overdrive.Gamepad.getUnboundGamepadArray();
        
        if (gamepads.length > 0) {
          
          let gamepadSelected = false;
          
          for (var i=0; i<gamepads.length && !gamepadSelected;) {
            
            gamepadSelected = overdrive.Gamepad.gamepadButtonPressed(gamepads[i]);
            
            if (!gamepadSelected) {
              
              ++i;
            }
          }
          
          if (gamepadSelected) {
            
            // Setup binding
            overdrive.Gamepad.bindings[0].gamepadIndex = gamepads[i].index;
            
            console.log('1 : ' + gamepads[i].index);
            
            // Set flag to say we're done
            self.player1Selected = true;
          }
        }
      }
      
      
      if (self.player1Selected) {
      
        window.requestAnimationFrame(self.player1PostConfirm);
      }
      else if (self.returnToMainMenu) {
        
        self.leaveState.id = 'mainMenu';
        window.requestAnimationFrame(self.leaveStage);
      }
      else {
        
        window.requestAnimationFrame(self.player1Confirm);
      }
    }
    
    this.player1PostConfirm = function() {
      
      console.log('player 1 selected');
      window.requestAnimationFrame(self.player2PreConfirm);
    }
    
    
    this.player2PreConfirm = function() {
      
      player2Message = [];
      
      if (overdrive.settings.players[1].mode==OverDrive.Game.InputMode.Keyboard) {
        
        player2Message.push(overdrive.settings.players[1].name + ' - Press the Accelerate key to start');
      }
      else if (overdrive.settings.players[1].mode==OverDrive.Game.InputMode.Gamepad) {
        
        let gamepads = overdrive.Gamepad.getUnboundGamepadArray();
        
        if (gamepads.length > 0) {
        
          player2Message.push(overdrive.settings.players[1].name + ' - Press any button on your gamepad to start!');
        }
        else {
          
          player2Message.push(overdrive.settings.players[1].name + ' - Plug in a controller...');
          player2Message.push('...and press any button to start!');
        }
      }
      
      self.player2Selected = false;
      
      window.requestAnimationFrame(self.player2Confirm);
    }
    
    
    this.player2Confirm = function() {
      
      self.draw(player2Message);
      
      if (overdrive.settings.players[1].mode==OverDrive.Game.InputMode.Keyboard) {
        
        if (self.keyPressed(overdrive.settings.players[1].keys.forward)) {
          
          self.player2Selected = true;
        }
      }
      else if (overdrive.settings.players[1].mode==OverDrive.Game.InputMode.Gamepad) {
        
        let gamepads = overdrive.Gamepad.getUnboundGamepadArray();
        
        if (gamepads.length > 0) {
          
          let gamepadSelected = false;
          
          for (var i=0; i<gamepads.length && !gamepadSelected;) {
            
            gamepadSelected = overdrive.Gamepad.gamepadButtonPressed(gamepads[i]);
            
            if (!gamepadSelected) {
              
              ++i;
            }
          }
          
          if (gamepadSelected) {
            
            // Setup binding
            overdrive.Gamepad.bindings[1].gamepadIndex = gamepads[i].index;
            
            console.log('2 : ' + gamepads[i].index);
            
            // Set flag to say we're done
            self.player2Selected = true;
          }
        }
      }
      
      
      if (self.player2Selected) {
      
        window.requestAnimationFrame(self.player2PostConfirm);
      }
      else if (self.returnToMainMenu) {
        
        self.leaveState.id = 'mainMenu';
        window.requestAnimationFrame(self.leaveStage);
      }
      else {
        
        window.requestAnimationFrame(self.player2Confirm);
      }
    }
    
    this.player2PostConfirm = function() {
      
      console.log('player 2 selected');
      
      self.leaveState.id = 'mainGame';
      self.leaveState.params = {
        level : 1
      };
      
      window.requestAnimationFrame(self.leaveStage);
    }
    
    this.leaveStage = function() {
      
      // Tear down stage
      $(document).off('keydown');
      $(document).off('keyup');
      
      self.backgroundImage = null;
      
      document.getElementById('GameDiv').removeChild(document.getElementById('returnToMenuButton'));
      
      var target = self.transitionLinks[self.leaveState.id];
      
      // Handle pre-transition (in target, not here! - encapsulation!)
      target.preTransition(self.leaveState.params);

      // Final transition from current stage
      window.requestAnimationFrame(target.init);
      
      // Clear leave state once done
      self.leaveState.id = null;
      self.leaveState.params = null;
    }
    
    
    // Event handling functions
    
    this.onKeyDown = function(event) {
      
      self.keyDown[event.keyCode] = true;
    }
    
    this.onKeyUp = function(event) {
      
      self.keyDown[event.keyCode] = false;
    }
    
    this.goBackToMenu = function(event) {
      
      self.returnToMainMenu = true;
    }
    
    
    // Stage processing functions
    
    this.keyPressed = function(keyCode) {
    
      return this.keyDown[overdrive.Keys[keyCode]];
    }
    
    
    // Draw background and message to player.  messageText may be an array, which is displayed across multiple lines
    this.draw = function(messageText) {
      
      // Draw background        
      if (self.backgroundImage) {
    
        context.globalAlpha = 0.4;
        self.backgroundImage.draw();
      }
      
      // Render message text
      
      context.globalAlpha = 1;
      
      context.fillStyle = '#FFF';
      context.font = '38pt Amatic SC';  
      
      var numLines = messageText.length;
      var baseY = 300 - (numLines / 2 * 30);
      
      for (var i=0; i<numLines; ++i, baseY+=44) {
      
        var textMetrics = context.measureText(messageText[i]);
        context.fillText(messageText[i], canvas.width * 0.5 - textMetrics.width / 2, baseY);
      }
    }
    
  };
  
  
  return stage;
  
})((OverDrive.Stages.InputConfirm || {}), OverDrive.canvas, OverDrive.context);

