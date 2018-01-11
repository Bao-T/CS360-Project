

OverDrive.Stages.Config = (function(stage, canvas, context) {
  
  // Private API
  let overdrive = OverDrive.Game.system;
  
  
  // Public Interface
  
  stage.Create = function() {
  
    return new stage.ConfigStage;
  }
  
  stage.ConfigStage = function() {
    
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
    this.exitConfig = false;
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
      
      console.log('settings (config) screen');
      
      if (self.keyDown === null) {
      
        self.keyDown = new Array(256);
      }
      
      for (var i=0; i<256; ++i) {
          
        self.keyDown[i] = false;
      }
      
      $(document).on('keyup', self.onKeyUp);
      $(document).on('keydown', self.onKeyDown);
      
      // Draw background        
      if (self.backgroundImage) {
        
        context.globalAlpha = 0.4;
        self.backgroundImage.draw();
      }
      
      context.globalAlpha = 1.0;
      
      // Create config DOM elements
      self.createPlayer1Elements();
      self.createPlayer2Elements();
      
      // Create additional controls
      var acceptButton = document.createElement('button');
      acceptButton.setAttribute('type', 'button');
      acceptButton.setAttribute('class', 'btn btn-default settingsField');
      acceptButton.setAttribute('id', 'configAcceptButton');
      acceptButton.appendChild(document.createTextNode('Accept'));
      document.getElementById('GameDiv').appendChild(acceptButton);
      $('#configAcceptButton').click(self.accept);
      
      var cancelButton = document.createElement('button');
      cancelButton.setAttribute('type', 'button');
      cancelButton.setAttribute('class', 'btn btn-default settingsField');
      cancelButton.setAttribute('id', 'configCancelButton');
      cancelButton.appendChild(document.createTextNode('Cancel'));
      document.getElementById('GameDiv').appendChild(cancelButton);
      $('#configCancelButton').click(self.cancel);
      
      
      self.exitConfig = false;
      
      window.requestAnimationFrame(self.mainLoop);
    }
    
    // Unused for this implementation
    this.phaseInLoop = function() {}
    
    this.mainLoop = function() {
            
      if (self.keyPressed('ESC')) {
        
        self.exitConfig = true;
      }
      
      // Repeat until exit condition met
      if (!self.exitConfig) {
      
        window.requestAnimationFrame(self.mainLoop);
      }
      else {
      
        self.leaveState.id = 'mainMenu';
        self.leaveState.params = {};
        
        window.requestAnimationFrame(self.leaveStage);
      }
    }
    
    this.initPhaseOut = function() {}
    this.phaseOutLoop = function() {}
    
    
    this.leaveStage = function() {
      
      // Tear down stage
      $(document).off('keydown');
      $(document).off('keyup');
      
      self.backgroundImage = null;
      
      document.getElementById('GameDiv').removeChild(document.getElementById('player1Div'));
      
      document.getElementById('GameDiv').removeChild(document.getElementById('player2Div'));
      
      document.getElementById('GameDiv').removeChild(document.getElementById('configAcceptButton'));
      
      document.getElementById('GameDiv').removeChild(document.getElementById('configCancelButton'));
      
      
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
    
    this.accept = function(event) {
      
      // Extract player 1 settings
      
      overdrive.settings.players[0].name = $('#player1NameField').val();
      
      overdrive.settings.players[0].keys.forward = $('#p1AccelKeyField').val().toUpperCase();
      
      overdrive.settings.players[0].keys.reverse = $('#p1BrakeKeyField').val().toUpperCase();
      
      overdrive.settings.players[0].keys.left = $('#p1LeftKeyField').val().toUpperCase();
      
      overdrive.settings.players[0].keys.right = $('#p1RightKeyField').val().toUpperCase();
      
      if (document.getElementById('p1ControllerButton').checked) {
        
        overdrive.settings.players[0].mode = OverDrive.Game.InputMode.Gamepad;
      }
      else if (document.getElementById('p1KeyboardButton').checked) {
        
        overdrive.settings.players[0].mode = OverDrive.Game.InputMode.Keyboard;
      }
      
      
      // Extract player 2 settings
      
      overdrive.settings.players[1].name = $('#player2NameField').val();
      
      overdrive.settings.players[1].keys.forward = $('#p2AccelKeyField').val().toUpperCase();
      
      overdrive.settings.players[1].keys.reverse = $('#p2BrakeKeyField').val().toUpperCase();
      
      overdrive.settings.players[1].keys.left = $('#p2LeftKeyField').val().toUpperCase();
      
      overdrive.settings.players[1].keys.right = $('#p2RightKeyField').val().toUpperCase();
      
      if (document.getElementById('p2ControllerButton').checked) {
        
        overdrive.settings.players[1].mode = OverDrive.Game.InputMode.Gamepad;
      }
      else if (document.getElementById('p2KeyboardButton').checked) {
        
        overdrive.settings.players[1].mode = OverDrive.Game.InputMode.Keyboard;
      }
      
      
      self.exitConfig = true;
    }
    
    this.cancel = function(event) {
      
      self.exitConfig = true;
    }
    
    // Stage processing functions
    
    this.keyPressed = function(keyCode) {
    
      return this.keyDown[overdrive.Keys[keyCode]];
    }
    
    
    this.draw = function() {
    }
    
    
    this.createPlayer1Elements = function () {
      
      var player1Div = document.createElement('div');
      player1Div.setAttribute('id', 'player1Div');
      
        // Header
        var player1SettingsHeader = document.createElement('h4');
        player1SettingsHeader.setAttribute('class', 'playerSettingsHeader');
        var p1HeaderText = document.createTextNode('Player 1 Settings');
        player1SettingsHeader.appendChild(p1HeaderText);
        
        player1Div.appendChild(player1SettingsHeader);
        
        // Name field
        var p1NameDiv = document.createElement('div');
        p1NameDiv.setAttribute('class', 'col-xs-6 settingsField settingsLabel playerNameLabel');
        
          var p1NameLabel = document.createElement('label');
          p1NameLabel.appendChild(document.createTextNode('Name'));
          
          p1NameDiv.appendChild(p1NameLabel);
        
        var p1NameFieldDiv = document.createElement('div');
        p1NameFieldDiv.setAttribute('class', 'col-xs-6 settingsField playerNameField');
        
          var p1NameInput = document.createElement('input');
          p1NameInput.setAttribute('type', 'text');
          p1NameInput.setAttribute('class', 'form-control');
          p1NameInput.setAttribute('id', 'player1NameField');
          p1NameInput.setAttribute('value', overdrive.settings.players[0].name);
        
          p1NameFieldDiv.appendChild(p1NameInput);
          
        player1Div.appendChild(p1NameDiv);
        player1Div.appendChild(p1NameFieldDiv);
        
      
        // Controller selection elements
        var p1ControlDiv = document.createElement('div');
        p1ControlDiv.setAttribute('class', 'settingsField rinput');
        
        
        p1ControllerLabel = document.createElement('label');
        p1ControllerLabel.setAttribute('class', 'radio-inline inputButtonBase');
        
        var p1CtrlInput = document.createElement('input');
        p1CtrlInput.setAttribute('type', 'radio');
        p1CtrlInput.setAttribute('name', 'p1InputMode');
        p1CtrlInput.setAttribute('id', 'p1ControllerButton');
        
        var p1CtrlImg = document.createElement('img');
        p1CtrlImg.setAttribute('src', 'Assets//Images//controller_icon.png');
        
        p1ControllerLabel.appendChild(p1CtrlInput);
        p1ControllerLabel.appendChild(p1CtrlImg);
        
        
        p1KeyboardLabel = document.createElement('label');
        p1KeyboardLabel.setAttribute('class', 'radio-inline');
        
        var p1KbInput = document.createElement('input');
        p1KbInput.setAttribute('type', 'radio');
        p1KbInput.setAttribute('name', 'p1InputMode');
        p1KbInput.setAttribute('id', 'p1KeyboardButton');
        
        var p1KbImg = document.createElement('img');
        p1KbImg.setAttribute('src', 'Assets//Images//keyboard_icon.png');
        
        p1KeyboardLabel.appendChild(p1KbInput);
        p1KeyboardLabel.appendChild(p1KbImg);
        
        
        p1ControlDiv.appendChild(p1ControllerLabel);
        p1ControlDiv.appendChild(p1KeyboardLabel);
        
        
        if (overdrive.settings.players[0].mode==OverDrive.Game.InputMode.Keyboard) {
        
          p1KbInput.setAttribute('checked', 'true');
        }
        else if (overdrive.settings.players[0].mode==OverDrive.Game.InputMode.Gamepad) {
          
          p1CtrlInput.setAttribute('checked', 'true');
        }
        
        
        player1Div.appendChild(p1ControlDiv);
        
      
        // Forward key field
        var forwardKeyDiv = document.createElement('div');
        forwardKeyDiv.setAttribute('class', 'col-xs-6 settingsField settingsLabel accelKeyLabel');
        
          var fkNameLabel = document.createElement('label');
          fkNameLabel.appendChild(document.createTextNode('Forward / Accelerate'));
          
          forwardKeyDiv.appendChild(fkNameLabel);
        
        var fkFieldDiv = document.createElement('div');
        fkFieldDiv.setAttribute('class', 'col-xs-3 settingsField accelKeyField');
        
          var fkInput = document.createElement('input');
          fkInput.setAttribute('type', 'text');
          fkInput.setAttribute('class', 'form-control');
          fkInput.setAttribute('id', 'p1AccelKeyField');
          fkInput.setAttribute('value', overdrive.settings.players[0].keys.forward);
        
          fkFieldDiv.appendChild(fkInput);
        
        
        // Reverse key field
        var reverseKeyDiv = document.createElement('div');
        reverseKeyDiv.setAttribute('class', 'col-xs-6 settingsField settingsLabel brakeKeyLabel');
        
          var bkNameLabel = document.createElement('label');
          bkNameLabel.appendChild(document.createTextNode('Reverse / Brake'));
          
          reverseKeyDiv.appendChild(bkNameLabel);
        
        var bkFieldDiv = document.createElement('div');
        bkFieldDiv.setAttribute('class', 'col-xs-3 settingsField brakeKeyField');
        
          var bkInput = document.createElement('input');
          bkInput.setAttribute('type', 'text');
          bkInput.setAttribute('class', 'form-control');
          bkInput.setAttribute('id', 'p1BrakeKeyField');
          bkInput.setAttribute('value', overdrive.settings.players[0].keys.reverse);
        
          bkFieldDiv.appendChild(bkInput);
          
        
        // Steer left key field
        var leftKeyDiv = document.createElement('div');
        leftKeyDiv.setAttribute('class', 'col-xs-6 settingsField settingsLabel leftKeyLabel');
        
          var lNameLabel = document.createElement('label');
          lNameLabel.appendChild(document.createTextNode('Steer Left'));
          
          leftKeyDiv.appendChild(lNameLabel);
        
        var lFieldDiv = document.createElement('div');
        lFieldDiv.setAttribute('class', 'col-xs-3 settingsField leftKeyField');
        
          var lInput = document.createElement('input');
          lInput.setAttribute('type', 'text');
          lInput.setAttribute('class', 'form-control');
          lInput.setAttribute('id', 'p1LeftKeyField');
          lInput.setAttribute('value', overdrive.settings.players[0].keys.left);
        
          lFieldDiv.appendChild(lInput);
          
          
        // Steer right key field
        var rightKeyDiv = document.createElement('div');
        rightKeyDiv.setAttribute('class', 'col-xs-6 settingsField settingsLabel rightKeyLabel');
        
          var rNameLabel = document.createElement('label');
          rNameLabel.appendChild(document.createTextNode('Steer Right'));
          
          rightKeyDiv.appendChild(rNameLabel);
        
        var rFieldDiv = document.createElement('div');
        rFieldDiv.setAttribute('class', 'col-xs-3 settingsField rightKeyField');
        
          var rInput = document.createElement('input');
          rInput.setAttribute('type', 'text');
          rInput.setAttribute('class', 'form-control');
          rInput.setAttribute('id', 'p1RightKeyField');
          rInput.setAttribute('value', overdrive.settings.players[0].keys.right);
        
          rFieldDiv.appendChild(rInput);
        
        
        player1Div.appendChild(forwardKeyDiv);
        player1Div.appendChild(fkFieldDiv);
        player1Div.appendChild(reverseKeyDiv);
        player1Div.appendChild(bkFieldDiv);
        player1Div.appendChild(leftKeyDiv);
        player1Div.appendChild(lFieldDiv);
        player1Div.appendChild(rightKeyDiv);
        player1Div.appendChild(rFieldDiv);
        
      document.getElementById('GameDiv').appendChild(player1Div);
    }
    
    
    this.createPlayer2Elements = function () {
      
      var player2Div = document.createElement('div');
      player2Div.setAttribute('id', 'player2Div');
      
        // Header
        var player2SettingsHeader = document.createElement('h4');
        player2SettingsHeader.setAttribute('class', 'playerSettingsHeader');
        var p2HeaderText = document.createTextNode('Player 2 Settings');
        player2SettingsHeader.appendChild(p2HeaderText);
        
        player2Div.appendChild(player2SettingsHeader);
        
        // Name field
        var p2NameDiv = document.createElement('div');
        p2NameDiv.setAttribute('class', 'col-xs-6 settingsField settingsLabel playerNameLabel');
        
          var p2NameLabel = document.createElement('label');
          p2NameLabel.appendChild(document.createTextNode('Name'));
          
          p2NameDiv.appendChild(p2NameLabel);
        
        var p2NameFieldDiv = document.createElement('div');
        p2NameFieldDiv.setAttribute('class', 'col-xs-6 settingsField playerNameField');
        
          var p2NameInput = document.createElement('input');
          p2NameInput.setAttribute('type', 'text');
          p2NameInput.setAttribute('class', 'form-control');
          p2NameInput.setAttribute('id', 'player2NameField');
          p2NameInput.setAttribute('value', overdrive.settings.players[1].name);
        
          p2NameFieldDiv.appendChild(p2NameInput);
          
        player2Div.appendChild(p2NameDiv);
        player2Div.appendChild(p2NameFieldDiv);
        
      
        // Controller selection elements
        var p2ControlDiv = document.createElement('div');
        p2ControlDiv.setAttribute('class', 'settingsField rinput');
        
        
        p2ControllerLabel = document.createElement('label');
        p2ControllerLabel.setAttribute('class', 'radio-inline inputButtonBase');
        
        var p2CtrlInput = document.createElement('input');
        p2CtrlInput.setAttribute('type', 'radio');
        p2CtrlInput.setAttribute('name', 'p2InputMode');
        p2CtrlInput.setAttribute('id', 'p2ControllerButton');
        
        var p2CtrlImg = document.createElement('img');
        p2CtrlImg.setAttribute('src', 'Assets//Images//controller_icon.png');
        
        p2ControllerLabel.appendChild(p2CtrlInput);
        p2ControllerLabel.appendChild(p2CtrlImg);
        
        
        p2KeyboardLabel = document.createElement('label');
        p2KeyboardLabel.setAttribute('class', 'radio-inline');
        
        var p2KbInput = document.createElement('input');
        p2KbInput.setAttribute('type', 'radio');
        p2KbInput.setAttribute('name', 'p2InputMode');
        p2KbInput.setAttribute('id', 'p2KeyboardButton');
        
        var p2KbImg = document.createElement('img');
        p2KbImg.setAttribute('src', 'Assets//Images//keyboard_icon.png');
        
        p2KeyboardLabel.appendChild(p2KbInput);
        p2KeyboardLabel.appendChild(p2KbImg);
        
        
        p2ControlDiv.appendChild(p2ControllerLabel);
        p2ControlDiv.appendChild(p2KeyboardLabel);
        
        
        if (overdrive.settings.players[1].mode==OverDrive.Game.InputMode.Keyboard) {
        
          p2KbInput.setAttribute('checked', 'true');
        }
        else if (overdrive.settings.players[1].mode==OverDrive.Game.InputMode.Gamepad) {
          
          p2CtrlInput.setAttribute('checked', 'true');
        }
        
        
        player2Div.appendChild(p2ControlDiv);
        
      
        // Forward key field
        var forwardKeyDiv = document.createElement('div');
        forwardKeyDiv.setAttribute('class', 'col-xs-6 settingsField settingsLabel accelKeyLabel');
        
          var fkNameLabel = document.createElement('label');
          fkNameLabel.appendChild(document.createTextNode('Forward / Accelerate'));
          
          forwardKeyDiv.appendChild(fkNameLabel);
        
        var fkFieldDiv = document.createElement('div');
        fkFieldDiv.setAttribute('class', 'col-xs-3 settingsField accelKeyField');
        
          var fkInput = document.createElement('input');
          fkInput.setAttribute('type', 'text');
          fkInput.setAttribute('class', 'form-control');
          fkInput.setAttribute('id', 'p2AccelKeyField');
          fkInput.setAttribute('value', overdrive.settings.players[1].keys.forward);
        
          fkFieldDiv.appendChild(fkInput);
        
        
        // Reverse key field
        var reverseKeyDiv = document.createElement('div');
        reverseKeyDiv.setAttribute('class', 'col-xs-6 settingsField settingsLabel brakeKeyLabel');
        
          var bkNameLabel = document.createElement('label');
          bkNameLabel.appendChild(document.createTextNode('Reverse / Brake'));
          
          reverseKeyDiv.appendChild(bkNameLabel);
        
        var bkFieldDiv = document.createElement('div');
        bkFieldDiv.setAttribute('class', 'col-xs-3 settingsField brakeKeyField');
        
          var bkInput = document.createElement('input');
          bkInput.setAttribute('type', 'text');
          bkInput.setAttribute('class', 'form-control');
          bkInput.setAttribute('id', 'p2BrakeKeyField');
          bkInput.setAttribute('value', overdrive.settings.players[1].keys.reverse);
        
          bkFieldDiv.appendChild(bkInput);
          
        
        // Steer left key field
        var leftKeyDiv = document.createElement('div');
        leftKeyDiv.setAttribute('class', 'col-xs-6 settingsField settingsLabel leftKeyLabel');
        
          var lNameLabel = document.createElement('label');
          lNameLabel.appendChild(document.createTextNode('Steer Left'));
          
          leftKeyDiv.appendChild(lNameLabel);
        
        var lFieldDiv = document.createElement('div');
        lFieldDiv.setAttribute('class', 'col-xs-3 settingsField leftKeyField');
        
          var lInput = document.createElement('input');
          lInput.setAttribute('type', 'text');
          lInput.setAttribute('class', 'form-control');
          lInput.setAttribute('id', 'p2LeftKeyField');
          lInput.setAttribute('value', overdrive.settings.players[1].keys.left);
        
          lFieldDiv.appendChild(lInput);
          
          
        // Steer right key field
        var rightKeyDiv = document.createElement('div');
        rightKeyDiv.setAttribute('class', 'col-xs-6 settingsField settingsLabel rightKeyLabel');
        
          var rNameLabel = document.createElement('label');
          rNameLabel.appendChild(document.createTextNode('Steer Right'));
          
          rightKeyDiv.appendChild(rNameLabel);
        
        var rFieldDiv = document.createElement('div');
        rFieldDiv.setAttribute('class', 'col-xs-3 settingsField rightKeyField');
        
          var rInput = document.createElement('input');
          rInput.setAttribute('type', 'text');
          rInput.setAttribute('class', 'form-control');
          rInput.setAttribute('id', 'p2RightKeyField');
          rInput.setAttribute('value', overdrive.settings.players[1].keys.right);
        
          rFieldDiv.appendChild(rInput);
        
        
        player2Div.appendChild(forwardKeyDiv);
        player2Div.appendChild(fkFieldDiv);
        player2Div.appendChild(reverseKeyDiv);
        player2Div.appendChild(bkFieldDiv);
        player2Div.appendChild(leftKeyDiv);
        player2Div.appendChild(lFieldDiv);
        player2Div.appendChild(rightKeyDiv);
        player2Div.appendChild(rFieldDiv);
        
      document.getElementById('GameDiv').appendChild(player2Div);
    }
  };
  
  
  return stage;
  
})((OverDrive.Stages.Config || {}), OverDrive.canvas, OverDrive.context);

