
//
// Implement region vertex proximity utiliy functions
//

OverDrive.Proximity = (function(pMod, canvas, context) {

  // Private API
  
  function ProximityList() {
    
    var self = this;
    
    this.closeLoopPoint = null;   // First point of newRegion if being constructed
    this.newRegionPoints = [];    // Every other point on the new region being constructed
    
    this.points = [];             // Points from every other stored region
    
    this.numPoints = function() {
    
      return self.newRegionPoints.length + self.points.length + (self.closeLoopPoint != null) ? 1 : 0;
    }
  }
  
  
  // Proximity interface
  
  pMod.CreateProximityList = function() {
    
    return new ProximityList();
  }
  
  
  // Return the squared distance between p1 and p2 scaled to canvas coordaintes
  pMod.SqrCanvasDist = function(p1, p2) {

    var dx = p1.x * canvas.width - p2.x * canvas.width;
    var dy = p1.y * canvas.height - p2.y * canvas.height;
                
    return dx * dx + dy * dy;
  }

  
  // Return true if |p1 - p2|^2 lies within a pre-determined threshold.  p1 and p2 are
  // provided as normalised coordinates while the proximity threshold is specified in pixels.
  pMod.PointInProximity = function(p1, p2, proximityThreshold) {
      
    return pMod.SqrCanvasDist(p1, p2) < proximityThreshold;
  }
  
  
  // Return a list of points in all regions that lie within a specified distance from pos.
  // The first point of the current newRegion has special significance - if in proximity
  // we close the current region by selecting this.  Therefore this is stored seperarely
  // from other points.  sourceList represents the region list to search.
  pMod.GetPointsInProximity = function(pos, sourceList, newRegion, proximityThreshold) {
 
    var P = new ProximityList();
    
    // First check current region (if being traced)
    if (newRegion) {
    
      // Check first point (for closing the loop of the current region)
      if (pMod.PointInProximity(pos, newRegion.points[0], proximityThreshold)) {
      
        P.closeLoopPoint = newRegion.points[0];
      }
      
      // Check points in newRegion
      for (var j=1; j < newRegion.points.length; ++j) {
      
        if (pMod.PointInProximity(pos, newRegion.points[j], proximityThreshold)) {
        
          P.newRegionPoints.push(newRegion.points[j]);
        }
      }
    }
    
    // Check previously defined regions in sourceList
    for (var i=0; i < sourceList.length; ++i) {
    
      for (var j=0; j < sourceList[i].points.length; ++j) {
      
        if (pMod.PointInProximity(pos, sourceList[i].points[j], proximityThreshold)) {
        
          // We store other region points a little differently - in addition
          // to the point coordinate, we store the region and point index as well
          P.points.push( {
          
            coord       : sourceList[i].points[j],
            regionIndex : i,
            pointIndex  : j
          });
        }
      }
    }
    
    return P;
  }
      
  
  // Return a list of points in R that are not in proximity list P.
  // R is a region list while P is an instance of ProximityList.  For P,
  // we only process the points array, not the newRegion structures.
  pMod.GetDisjointPointSet = function(P, R) {
      
    var S = [];
    
    // Iterate through each region
    for (var i=0; i < R.length; ++i) {
    
      // Iterate through each point Pj in region Ri
      for (var j=0; j < R[i].points.length; ++j) {
      
        var found = false;
        
        // Iterate through P to see if Pj is present
        for (var k=0; k < P.points.length && !found; ++k) {
        
          found = (P.points[k].regionIndex==i && P.points[k].pointIndex==j)
        }
        
        if (!found) {
        
          S.push( {
          
            coord       : R[i].points[j],
            regionIndex : i,
            pointIndex  : j
          });
        }
      }
    }
    
    return S;
  }
  
  
  // Return static points in proximity to a given coordinate.  sourceList
  // follows the structure defined in GetDisjointPointSet above.  The returned
  // list P is simpler than proximityList - no newRegion structures are present.
  pMod.GetStaticPointsInProximity = function(pos, sourceList, proximityThreshold) {
  
    var P = [];
     
    // Check previously defined regions in sourceList.  Unlike GetPointsInProximity,
    // sourceList is a flat list of points, not organised into regions.
    for (var i=0; i < sourceList.length; ++i) {
              
      if (pMod.PointInProximity(pos, sourceList[i].coord, proximityThreshold)) {
      
        // We store other region points a little differently - in addition
        // to the point coordinate, we store the region and point index as well
        P.push(sourceList[i]);
      }
    }
    
    return P;
  }
  
  
  // Return true if p is in L.  This is determined by p.regionIndex==L[i].regionIndex && p.pointIndex==L[i].pointIndex
  // This is different from PointInProximity which relies on coordinates.
  pMod.PointInList = function(p, L) {
  
    var found = false;
    
    for (var i = 0; i < L.length && !found; ++i) {
    
      found = (p.regionIndex==L[i].regionIndex && p.pointIndex==L[i].pointIndex);
    }
    
    return found;
  }
  
  
  return pMod;
  
})((OverDrive.Proximity || {}), OverDrive.canvas, OverDrive.context);