
//
// JavaScript implementation of gametime clock
//

OverDrive.Game = (function(gamelib, canvas, context) {
  
  gamelib.FrameCounter = function() {

    this.frame = 0;
    this.fpsRefTimeIndex = 0;
    this.fpsCounts = 0;
    
    this.framesPerSecond = 0;
    this.minFPS = 0;
    this.maxFPS = 0;
    this.averageFPS = 0;
    
    this.secondsPerFrame = 0;
    this.minSPF = 0;
    this.maxSPF = 0;
    this.averageSPF = 0;
    
    this.resetCounter = function() {
    
      this.frame = 0;
      this.fpsRefTimeIndex = 0;
      this.fpsCounts = 0;
      
      this.framesPerSecond = 0, this.minFPS = 0, this.maxFPS = 0, this.averageFPS = 0;
      this.secondsPerFrame = 0, this.minSPF = 0, this.maxSPF = 0, this.averageSPF = 0;
    }
    
    this.updateFrameCounterForElapsedTime = function(gameTimeElapsed) {
    
      this.frame = this.frame + 1;
      
      var time_delta = gameTimeElapsed - this.fpsRefTimeIndex;
      
      if (time_delta >= 1.0) {
      
        this.framesPerSecond = this.frame / time_delta;
        this.secondsPerFrame = 1 / this.framesPerSecond;
        
        if (this.fpsCounts==0) {
        
          this.minFPS = this.framesPerSecond;
          this.maxFPS = this.framesPerSecond;
          this.averageFPS = this.framesPerSecond;
          
          this.minSPF = this.secondsPerFrame;
          this.maxSPF = this.secondsPerFrame;
          this.averageSPF = this.secondsPerFrame;
        }
        else {
        
          // Update min, max and average frames-per-second
          if (this.framesPerSecond < this.minFPS) {
          
            this.minFPS = this.framesPerSecond;
          }
          else if (this.framesPerSecond > this.maxFPS) {
          
            this.maxFPS = this.framesPerSecond;
          }
          
          this.averageFPS = this.averageFPS + this.framesPerSecond;
          
          // Update min, max and average seconds-per-frame
          if (this.secondsPerFrame < this.minSPF) {
          
            this.minSPF = this.secondsPerFrame;
          }
          else if (this.secondsPerFrame > this.maxSPF) {
          
            this.maxSPF = this.secondsPerFrame;
          }
          
          this.averageSPF = this.averageSPF + this.secondsPerFrame;
        }
        
        this.frame = 0;
        this.fpsRefTimeIndex = gameTimeElapsed;
        this.fpsCounts = this.fpsCounts + 1;
      }
    }
    
    this.getAverageFPS = function() {
    
      return this.averageFPS / this.fpsCounts;
    }
    
    this.getAverageSPF = function() {
    
      return this.averageSPF / this.fpsCounts;
    }
  }

  gamelib.Clock = function() {

    this.performanceFrequency = 1000; // performance.now captured in milliseconds
    this.timeRecip = 1 / this.performanceFrequency;
    
    this.actualTime = function() {
    
      return window.performance.now();
    }
    
    this.convertTimeIntervalToSeconds = function(t) {
    
      return t * this.timeRecip;
    }
    
    
    this.baseTime = this.actualTime();
    this.prevTimeIndex = this.baseTime;
    
    this.currentTimeIndex = 0;
    
    this.deltaTime = 0;
    
    this.stopTimeIndex = 0;
    this.totalStopTime = 0;
    
    this.clockStopped = false;
    
    this.frameCounter = new gamelib.FrameCounter();
    
    
    this.resetClockAttributes = function() {
    
      this.baseTime = this.actualTime();
      
      this.prevTimeIndex = this.baseTime;
      
      this.deltaTime = 0;
      
      this.stopTimeIndex = 0;
      this.totalStopTime = 0;
      
      this.clockStopped = false;
      
      this.frameCounter = new FrameCounter();
    }
    
    this.invalidateClock = function() {
    
      this.baseTime = 0;
      this.prevTimeIndex = 0;
      this.currentTimeIndex = 0;
    
      this.deltaTime = 0;
    
      this.stopTimeIndex = 0;
      this.totalStopTime = 0;
    
      this.clockStopped = true;
    
      this.frameCounter = null;
    }
    
    this.start = function() {
    
      if (this.clockStopped) {
      
        let restartTimeIndex = this.actualTime();
        
        this.totalStopTime = this.totalStopTime + (restartTimeIndex - this.stopTimeIndex);
        this.prevTimeIndex = restartTimeIndex;
        this.clockStopped = false;
      }
    }
    
    this.stop = function() {
    
      if (!this.clockStopped) {
      
        this.stopTimeIndex = this.actualTime();
        this.clockStopped = true;
      }
    }
    
    this.tick = function() {
    
      if (this.clockStopped) {
      
        this.deltaTime = 0;
      }
      else {
      
        this.currentTimeIndex = this.actualTime();
        this.deltaTime = this.currentTimeIndex - this.prevTimeIndex;
        this.prevTimeIndex = this.currentTimeIndex;
        
        if (this.frameCounter) {
        
          let t = (this.currentTimeIndex - this.baseTime) - this.totalStopTime;
          this.frameCounter.updateFrameCounterForElapsedTime(this.convertTimeIntervalToSeconds(t));
        }
      }
    }
    
    this.reset = function() {
    
      this.resetClockAttributes();
      
      if (frameCounter) {
      
        frameCounter.resetCounter();
      }
    }
    
    this.actualTimeElapsed = function() {
    
      return this.convertTimeIntervalToSeconds(this.actualTime() - this.baseTime);
    }
    
    this.gameTimeElapsed = function() {
    
      let t = (((this.clockStopped) ? this.stopTimeIndex : this.actualTime()) - this.baseTime) - this.totalStopTime;
      return this.convertTimeIntervalToSeconds(t);
    }
  }

  
  return gamelib;
  
})((OverDrive.Game || {}), OverDrive.canvas, OverDrive.context);
