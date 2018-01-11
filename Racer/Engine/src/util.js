// Useful utility functions

OverDrive.Game = (function(gamelib, canvas, context) {
  
  // Function to iterate through an array and draw contained objects
  gamelib.drawObjects = function(collection) {

    for (i=0;i<collection.length; ++i) {

      if (collection[i]) {
      
        collection[i].draw();            
      }
    }
  }


  // canvas event handler to enter fullscreen mode
  gamelib.enterFullscreen = function(element) {
    
    if (element.requestFullscreen) {
    
      // Generic
      if (document.fullScreenElement) {
      
        document.cancelFullScreen();
        console.log("cancelFullScreen");
      }
      else {
      
        element.requestFullscreen();
        console.log("requestFullscreen");
      }
    }
    else if (element.msRequestFullscreen) {
    
      // Edge / IE
      if (document.msFullscreenElement) {
      
        document.msExitFullscreen();
        console.log("msExitFullscreen");
      }
      else {
      
        element.msRequestFullscreen();
        console.log("msRequestFullscreen");
      }

    }
    else if (element.mozRequestFullScreen) {
    
      // Firefox
      if (document.mozFullScreenElement) {
        
        document.mozCancelFullScreen();
        console.log("mozCancelFullScreen");
      }
      else {
      
        element.mozRequestFullScreen();
        console.log("mozRequestFullScreen");
      }
    }
    else if (element.webkitRequestFullscreen) {
    
      // Chrome
      if (document.webkitFullscreenElement) {
      
        document.webkitCancelFullScreen();
        console.log("webkitCancelFullScreen");
      }
      else {
      
        element.webkitRequestFullscreen();
        console.log("webkitRequestFullscreen");
      }
    }
  }

  gamelib.drawHUD = function(player1, player2, showActualTime, elapsedSeconds, maxLaps) {

    // Draw HUD
    context.fillStyle = '#FFF';
    context.font = '30pt Amatic SC';
    //context.font = '30pt Faster One';
    
    var textMetrics = context.measureText(player1.pid);
    context.fillText(player1.pid, canvas.width * 0.2 - textMetrics.width / 2, 50);
    
    var textMetrics = context.measureText(player2.pid);
    context.fillText(player2.pid, canvas.width * 0.8 - textMetrics.width / 2, 50);
    
    
    context.font = '24px Amatic SC';
    
    var textMetrics = context.measureText('Points: ' + player1.score);
    context.fillText('Points: ' + player1.score, canvas.width * 0.2 - textMetrics.width / 2, 110);
    
    var textMetrics = context.measureText('Points: ' + player2.score);
    context.fillText('Points: ' + player2.score, canvas.width * 0.8 - textMetrics.width / 2, 110);
    
    
    var p1Lap = Math.min(player1.pathLocation.currentIteration + 1, maxLaps);
    var p2Lap = Math.min(player2.pathLocation.currentIteration + 1, maxLaps);
    
    var textMetrics = context.measureText('Lap: ' + p1Lap);
    context.fillText('Lap: ' + p1Lap, canvas.width * 0.2 - textMetrics.width / 2, 80);
    
    var textMetrics = context.measureText('Lap: ' + p2Lap);
    context.fillText('Lap: ' + p2Lap, canvas.width * 0.8 - textMetrics.width / 2, 80);
    
    // Draw main clock
    
    var clockString;
    
    if (showActualTime) {
        
      var secs = Math.floor(elapsedSeconds % 60);
      var mins = Math.floor(elapsedSeconds / 60);
      
      var minsPrefix = (mins < 10) ? '0' : '';
      var secsPrefix = (secs < 10) ? '0' : '';
      
      clockString = minsPrefix + mins + ' : ' + secsPrefix + secs;      
    }
    else {
      
      clockString = '00 : 00';
    }
    
    context.font = '30pt Amatic SC';
    
    var textMetrics = context.measureText(clockString);
    context.fillText(clockString, canvas.width * 0.5 - textMetrics.width / 2, 50);
    
  }

  
  return gamelib;
  
})((OverDrive.Game || {}), OverDrive.canvas, OverDrive.context);
