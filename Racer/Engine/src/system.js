

// Load demo sound effect

var music1 = null;
var music2 = null;
var music3 = null;


function loadDemoSoundAsync(soundURL, fn) {
  
  console.log('loading ' + soundURL);
  
  var sfxRequest = new XMLHttpRequest();
  sfxRequest.open("GET", soundURL, true);
  sfxRequest.responseType = "arraybuffer";
  sfxRequest.onload = function() {
     
    OverDrive.Game.system.audioContext.decodeAudioData(
    
      sfxRequest.response,
      fn,
      function(e){console.log("Error with decoding audio data" + e.err)}
    );
  };
  
  sfxRequest.send();
}

/*
function playTestSound(sound) {
  
  console.log('playing sound!');
  
  var audioContext = OverDrive.Game.system.audioContext;
  
  var source = audioContext.createBufferSource();
  source.buffer = sound.buffer;
  
  //source.connect(audioContext.destination);
  source.connect(OverDrive.Game.system.gainNode);
  
  source.start(0);
}
*/


// Model singleton system object

OverDrive.Game = (function(gamelib, canvas, context) {

  gamelib.InputMode = { Keyboard : 0, Gamepad : 1 };
  
  // An audio resource is a wrapper for a raw sound buffer
  gamelib.AudioResource = function(soundBuffer) {
    
    this.buffer = soundBuffer;
    
    this.play = function(startTimeIndex, endedEventHandler) {
      
      let audioContext = OverDrive.Game.system.audioContext;
  
      let sourceNode = audioContext.createBufferSource();
      sourceNode.buffer = this.buffer;
      
      sourceNode.connect(OverDrive.Game.system.gainNode);
      sourceNode.onended = endedEventHandler;
      
      sourceNode.start(startTimeIndex);
    }
  }
  
  
  gamelib.System = function() {
    
    var self = this;
    
    this.canvas = canvas;
    this.context = context;
    
    this.gameClock = new OverDrive.Game.Clock();
    this.engine = Matter.Engine.create();
        
    this.Keys = {
      
      RETURN : 13,
      ESC : 27,
      SPACE : 32,
      PGUP : 33,
      PGDOWN : 34,
      END : 35,
      HOME : 36,
      
      
      LEFT : 37,
      UP : 38,
      RIGHT : 39,
      DOWN : 40,
      
      DEL : 46,
    
      K_0 : 48, K_1 : 49, K_2 : 50, K_3 : 51, K_4 : 52, K_5 : 53, K_6 : 54,
      K_7 : 55, K_8 : 56, K_9 : 57, 
      
      A : 65, B : 66, C : 67, D : 68, E : 69, F : 70, G : 71, H : 72, I : 73,
      J : 74, K : 75, L : 76, M : 77, N : 78, O : 79, P : 80, Q : 81, R : 82,
      S : 83, T : 84, U : 85, V : 86, W : 87, X : 88, Y : 89, Z : 90
    }
    
    this.settings = {
    
      players : [
      
        {
          name : 'Player 1',
          mode : gamelib.InputMode.Keyboard,
          keys : {
            
            forward : 'Q',
            reverse : 'A',
            left : 'Z',
            right : 'X'
          }
        },
        
        {
          name : 'Player 2',
          mode : gamelib.InputMode.Gamepad,
          keys : {
            
            forward : 'P',
            reverse : 'L',
            left : 'N',
            right : 'M'
          }
        }
      ],
      
      sfxVolume : 50,
      musicVolume : 50
    };
    
    // Stage graph
    this.stageGraph = null;
    
    // High scores
    this.scores = [
    
      { name : 'Bilbo', score : 150 },
      { name : 'Woody', score : 120 },
      { name : 'Buzz', score : 100 },
      { name : 'BB-8', score : 80 },
      { name : 'Mr Ploppy', score : 60 },
      { name : 'Darth Vader', score : 50 }
    ];
    
    // Sort scores array from highest to lowest
    this.sortScores = function() {
      
      this.scores.sort(function(a, b) {
      
        return b.score - a.score;
      });
    }
    
    
    // Gamepad API
    
    this.Gamepad = {
      
      gamepads : {},
      observers : [],
      bindings : [
      
        {gamepadIndex : -1}, // player 1 gamepad binding (-1 == invalid; >=0 == valid)
        {gamepadIndex : -1}  // player 2 gamepad binding (-1 == invalid; >=0 == valid)
      ],
      
      connected : function(event) {
        
        var gamepad = event.originalEvent.gamepad;
        
        self.Gamepad.gamepads[gamepad.index] = gamepad;
        
        console.log('gamepad %d CONNECTED ', gamepad.index);
        console.log('id = ' + gamepad.id);
        console.log('mapping = ' + gamepad.mapping);
        console.log('connected = ' + gamepad.connected);
        console.log('buttons = ' + gamepad.buttons);
        console.log('axes = ' + gamepad.axes);
        console.log('timestamp = ' + gamepad.timestamp);
      },
      
      disconnected : function(event) {
      
        var gamepad = event.originalEvent.gamepad;
      
        delete self.Gamepad.gamepads[gamepad.index];
        
        // Remove any player-gamepad bindings
        self.Gamepad.removeGamepadBinding(gamepad);
        
        console.log('gamepad %d removed ', gamepad.index);
      },
      
      createGamepadBinding : function(playerIndex, gamepad) {
        
        self.Gamepad.binding[playerIndex].gamepadIndex = gamepad.index;
      },
      
      removeGamepadBinding : function(gamepad) {
        
        if (self.Gamepad.bindings[0].gamepadIndex==gamepad.index) {
          
          self.Gamepad.bindings[0].gamepadIndex = -1;
        }
        else if (self.Gamepad.bindings[1].gamepadIndex==gamepad.index) {
          
          self.Gamepad.bindings[1].gamepadIndex = -1;
        }
      },
      
      clearBindings : function() {
        
        this.bindings[0].gamepadIndex = -1;
        this.bindings[1].gamepadIndex = -1;
      },
      
      // Return true if the given gamepad is already bound to a player, false otherwise
      isGamepadBound : function(gamepadIndex) {
      
        return (gamepadIndex==self.Gamepad.bindings[0].gamepadIndex ||
                gamepadIndex==self.Gamepad.bindings[1].gamepadIndex);
      },
      
      getConnectedGamepadIndices : function() {
        
        return Object.keys(self.Gamepad.gamepads);
      },
      
      // getConnectedGamepadArray and getUnboundGamepadArray return an array of connected gamepads (the latter containing only unbound gamepads ie. not selected by any player).  This is not the same as the above gamepads object (which stores gamespads in key-value pairs).  Also note, the index in the returned array DOES NOT correspond with the actual gamepad index value.
      getConnectedGamepadArray : function() {
      
        var G = [];
        
        var padIndices = this.getConnectedGamepadIndices();
        
        for (var i=0;i < padIndices.length; ++i) {
        
          G.push(this.gamepads[padIndices[i]]);
        }
        
        return G;
      },
      
      getUnboundGamepadArray : function() {
        
        var G = [];
        
        var padIndices = this.getConnectedGamepadIndices();
        
        for (var i=0;i < padIndices.length; ++i) {
          
          if (!this.isGamepadBound(padIndices[i])) {
          
            G.push(this.gamepads[padIndices[i]]);
          }
        }
        
        return G;
      },
      
      // Return true if any button on the given gamepad has been pressed
      gamepadButtonPressed : function(gamepad) {
        
        var buttonPressed = false;
        
        for (var i=0; i<gamepad.buttons.length && !buttonPressed; ++i) {
          
          buttonPressed = gamepad.buttons[i].pressed;
        }
        
        return buttonPressed;
      },
      
      registerObserver : function(observer, eventType, fn, tag='generic') {
      
        let observers = self.Gamepad.observers;
        
        observers.push( {
          
          observer : observer,
          eventType : eventType,
          handler : fn,
          tag : tag
        });
      },
      
      unregisterObserver : function(observer, eventType='all', tag='all') {
        
        let observers = self.Gamepad.observers;
        
        for (var i=0; i<observers.length;) {
          
          if (observers[i].observer===observer &&
              (eventType=='all' || eventType==observers[i].eventType) &&
              (tag=='all' || tag==observers[i].tag)) {
          
            observers.splice(i, 1);
          
          } else {
            
            ++i;
          }
        }
      },
      
      unregisterAllObservers : function() {
        
        self.Gamepad.observers = [];
      }
      
    };
    
    // Setup gamepad events
    $(window).on('gamepadconnected', this.Gamepad.connected);
    $(window).on('gamepaddisconnected', this.Gamepad.disconnected);
    
    
    // Audio API
    
    this.playMusic1 = function() {
      
      music1.play(0, self.playMusic2);
    }
    
    this.playMusic2 = function() {
      
      music2.play(0, self.playMusic3);
    }
    
    this.playMusic3 = function() {
      
      music3.play(0, self.playMusic1);
    }
    
    
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    if (!this.audioContext) {

      console.log("Web Audio API NOT supported");
    }
    else {
      
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      
      // Load sound library
      loadDemoSoundAsync('Assets/Sounds/Kyes_music.m4a', function(buffer) {
        
        music1 = new gamelib.AudioResource(buffer);
        
        // Bootstrap - Start playing music1
        self.playMusic1();
      });
      
      loadDemoSoundAsync('Assets/Sounds/Mason_and_jack.m4a', function(buffer) {
        
        music2 = new gamelib.AudioResource(buffer);
      });
      
      loadDemoSoundAsync('Assets/Sounds/Kory_music.m4a', function(buffer) {
        
        music3 = new gamelib.AudioResource(buffer);
      });
    }
    
    
  }
  
  gamelib.system = null;
  
  return gamelib;
  
})((OverDrive.Game || {}), OverDrive.canvas, OverDrive.context);
