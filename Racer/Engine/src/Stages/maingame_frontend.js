
//
// Main OverDrive Game Logic
//



OverDrive.Stages.MainGame = (function(stage, canvas, context) {
  
  stage.MainGame.prototype.setup = function() {
    
    this.createTrack();
    this.createScenery();
    this.setupBackground();
    this.initialiseCamera();
    this.createPlayer1();
    this.createPlayer2();
    this.startClock();
    
    this.startGameLoop();
  }
  
  
  stage.MainGame.prototype.mainLoop = function() {
    
    this.updateClock();
    
    this.animatePlayers();
    
    this.drawNewAnimationFrame();
    
    if (this.player1CrossedFinishLine() || this.player2CrossedFinishLine()) {
      
      this.leaveGameLoop();
    }
    else {
      
      this.repeatGameLoop();
    }
  }
  
  
  
  return stage;
  
})((OverDrive.Stages.MainGame || {}), OverDrive.canvas, OverDrive.context);