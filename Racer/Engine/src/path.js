
// Model track path and associated collision regions


OverDrive.Game = (function(gamelib, canvas, context) {
  
  gamelib.Path = function(regions, world, iterationsToComplete = 1) {
  
    var self = this;
    
    this.regions = regions;
    
    for (var i=0; i < regions.length; ++i) {
      
      var scaledVertices = [];
      
      var centre = { x : 0, y : 0 };
      
      // Get centre coord
      for (var j=0; j<regions[i].collisionModel.vertices.length; ++j) {
                
        centre.x += regions[i].collisionModel.vertices[j].x * canvas.width;
        centre.y += regions[i].collisionModel.vertices[j].y * canvas.height;
      }
      
      centre.x /= regions[i].collisionModel.vertices.length;
      centre.y /= regions[i].collisionModel.vertices.length;
      
      for (var j=0; j<regions[i].collisionModel.vertices.length; ++j) {
                
        scaledVertices.push({ x : regions[i].collisionModel.vertices[j].x * canvas.width,
                              y : regions[i].collisionModel.vertices[j].y * canvas.height});
      }
      
      var collisionRegion = Matter.Bodies.fromVertices(centre.x, centre.y, scaledVertices, { isSensor : true });
      
      // Setup index reference to this path model
      collisionRegion.hostObject = self;
      collisionRegion.pathIndex = i;
      
      // Set collision properties and add to main world
      collisionRegion.collisionFilter.group = 0;
      collisionRegion.collisionFilter.category = OverDrive.Game.CollisionModel.PathNode.Category;
      collisionRegion.collisionFilter.mask = OverDrive.Game.CollisionModel.PathNode.Mask;
            
      Matter.World.add(world, collisionRegion);
    }
    
    // Determine if open or closed
    this.isClosed = (regions[0].graph.length==2 &&
                     regions[0].graph[0].index == 1 &&
                     regions[0].graph[1].index == regions.length - 1);
    
    
    // Setup path completion status
    this.maxIterations = iterationsToComplete;
    
    this.initPathPlacement = function() {
    
      return {
        
        hostPath : self,
        
        // Track progress through path
        currentIteration : 0,
        pathComplete : false,
        
        // When first run, we MUST collide with region 0 (this is a constraint on player placement for OverDrive so okay!)
        currentRegionIndex : -1,
        nextExpectedRegions : [0],
        
        // We can go back to this and continue on if need be
        largestRegionIndex : -1
      };
    }
        
    // Path collision interface
    this.doCollision = function(otherBody, env) {
            
      // Reverse collider order for 2nd dispatch - so all recievers assume objA is associated collider
      otherBody.collideWithPath(this, {
        
        objA : env.objB,
        objB : env.objA,
        host : env.host
      });
    }
    
    // Handle main collision here (player - only other object that collides with path - triple dispatches to here)
    this.collideWithPlayer = function(player, env) {
      
      // console.log('region collision: %d; player = ', env.objA.pathIndex, player.pid);
      
      var pathLocation = player.pathLocation;
      
      // Index of where we're going
      var Rindex = env.objA.pathIndex;
      
      // Is it valid? i = next region to progress to based on current index
      var i = pathLocation.nextExpectedRegions.indexOf(Rindex);
      
      if (i != -1 || Rindex < pathLocation.currentRegionIndex || Rindex==pathLocation.largestRegionIndex) {
        
        // Collider's region is valid to proceed...
        
        // Check if we're completing the loop for cyclic paths
        if (i!=-1 && self.isClosed && pathLocation.currentRegionIndex==self.regions.length - 1) {
          
          pathLocation.currentIteration++;
          console.log('Lap = ' + pathLocation.currentIteration);
          
          pathLocation.largestRegionIndex = -1;
          
          if (pathLocation.currentIteration == self.maxIterations) {
            
            pathLocation.pathComplete = true; // we're done!  Just set this once!
            console.log('Closed path complete!!!');
          }
        }
        
        // Proceed to new region
        pathLocation.currentRegionIndex = Rindex;
        
        console.log('proceed to : ' + pathLocation.currentRegionIndex);
        
        // Track last point on track we've been
        if (Rindex > pathLocation.largestRegionIndex) {
          
          pathLocation.largestRegionIndex = Rindex;
        }
        
        
        // Based on new region we've just entered, determine next valid regions we can proceed to...
        if (pathLocation.currentRegionIndex==0) {
          
          if (self.isClosed) {
            
            pathLocation.nextExpectedRegions = [1];
          
          } else {
            
            pathLocation.nextExpectedRegions = [];
            
            for (var j=0; j<self.regions[pathLocation.currentRegionIndex].graph.length; ++j) {
              
                pathLocation.nextExpectedRegions.push(self.regions[pathLocation.currentRegionIndex].graph[j].index);
            }
          }
        }
        else if (pathLocation.currentRegionIndex==self.regions.length-1) {
          
          // Entered last region
          if (self.isClosed) {
            
            pathLocation.nextExpectedRegions = [0];
          }
          else {
            
            pathLocation.pathComplete = true; // For open paths, iteration count does not matter!
            console.log('Open path complete!!!');
          }
        }
        else {
          
          pathLocation.nextExpectedRegions = [];
          
          for (var j=0; j<self.regions[pathLocation.currentRegionIndex].graph.length; ++j) {
            
              pathLocation.nextExpectedRegions.push(self.regions[pathLocation.currentRegionIndex].graph[j].index);
          }
        }
      }
      
    }
    
  }
  
  return gamelib;
  
})((OverDrive.Game || {}), OverDrive.canvas, OverDrive.context);

