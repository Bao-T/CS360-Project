
//
// General utility functions
//

OverDrive.MetLib = (function(ml) {
    
  ml.fEqual = function(a, b, epsilon = 0.00000001) {
  
    return Math.abs(a - b) < epsilon;
  }
  
  return ml;
  
})(OverDrive.MetLib || {});