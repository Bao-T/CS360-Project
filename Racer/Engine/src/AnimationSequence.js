
//
// Animation sequence model
//


// Immutable animation sequence the defines the general properties of a sequence.  Sequence instances
// refer to this and use it's contained data as the basis for rendering and updating frames.
function AnimationSequence(config) {
  
  this.spriteSheet = config.spriteSheet;
  
  // Model sequence frame range [startFrame, endFrame] - see SpriteSheet.js for how frames are indexed
  // If startFrame > endFrame then the sequence runs in reverse.
  this.startFrame = config.startFrame;
  this.endFrame = config.endFrame;
  
  this.oscillate = config.oscillate; // Determine if animations frames increase monotonically or bitonically
}


// Model a sequence instance used to track time-based animation for a specific object / object state
function SequenceInstance(sequence) {
  
  this.sequence = sequence; // Reference immutable animation sequence
  
  this.fStart = sequence.startFrame;
  this.fEnd = sequence.endFrame; 
  this.fCurrent = this.fStart;
  this.frameDelta = (this.fEnd >= this.fStart) ? 1 : -1;
  
  // Store time index when animation instance created.  This serves as the basis for time-based animation.
  this.timeIndex = 0; // Current time index
  this.frameIndex = 0;
  
  // Get constant seconds-per-frame for the current animation
  this.fInterval = this.sequence.spriteSheet.invFPS;
  
  //console.log("fInterval = " + this.fInterval);
  
  this.updateFrame = function(timeDelta) {
    
    var timeIndexNew = this.timeIndex + timeDelta;
    var frameIndexNew = Math.floor(timeIndexNew / this.fInterval);
    
    //console.log(this.timeIndex);
    
    // Update animation frame (fCurrent).  If frameIndexNew = this.frameIndex, we advance
    // by 0 frames.  Typically we advance by no more than 1 frame.
    var numFramesToAdvance = frameIndexNew - this.frameIndex;
    
    while (numFramesToAdvance > 0) {
    
      if (this.fCurrent == this.fEnd) {
      
        // Need to loop
        if (this.sequence.oscillate == true) {
          
          // bitonic sequence so swap order we proceed through sequence
          let temp = this.fStart;
          this.fStart = this.fEnd;
          this.fEnd = temp;
          
          this.frameDelta = this.frameDelta * -1;
          
          this.fCurrent = this.fCurrent + this.frameDelta;
        }
        else {
          
          // Simple monotonic increments of frame index - simply set fCurrent back to fStart
          this.fCurrent = this.fStart;
        }
      }
      else {
        
        // Simply update frame
        this.fCurrent = this.fCurrent + this.frameDelta;
      }
      
      numFramesToAdvance--;
    }
    
    // Update timeIndex
    this.timeIndex = timeIndexNew;
    
    // Update frameIndex
    // *** For now increate monotonically - may trap an upper-bound and cycle
    // but number ranges we're talking about are fine ***
    this.frameIndex = frameIndexNew;
  }
  
}