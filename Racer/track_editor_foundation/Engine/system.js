
// Model singleton system object

OverDrive.Game = (function(gamelib, canvas, context) {

  gamelib.System = function() {
        
    this.canvas = canvas;
    this.context = context;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    if (!this.audioContext) {

      console.log("Web Audio API NOT supported");
    }
    
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

    // Stage graph
    this.stageGraph = null;
  }


  gamelib.system = null;

  
  return gamelib;
  
})((OverDrive.Game || {}), OverDrive.canvas, OverDrive.context);






// Load demo sound effect
/*
function loadDemoSoundAsync(soundURL) {
  
  var sfxRequest = new XMLHttpRequest();
  sfxRequest.open("GET", soundURL, true);
  sfxRequest.responseType = "arraybuffer";
  sfxRequest.onload = function() {
     
    audioContext.decodeAudioData(
    
      sfxRequest.response,
      
      function(buffer) {
        sfx = buffer;
      },
      
      function(e){console.log("Error with decoding audio data" + e.err)});
  };
  sfxRequest.send();
}
*/
