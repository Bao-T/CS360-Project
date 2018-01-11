
// Model collision region

OverDrive.Region = (function(rl, canvas, context) {
    
    // Factory method
    rl.Create = function() {
      
      return {
        
        points : [],
        graph : [],
        collisionModel : {
          
          vertices : null,
          isConvex : false
        }
      };
    }
    
    
    rl.BuildCollisionModel = function(region) {
      
      // Construct vertex model
      region.collisionModel.vertices = Matter.Vertices.create(region.points, Matter.Body.create({}));
      
      // Ensure points are ordered clockwise
      Matter.Vertices.clockwiseSort(region.collisionModel.vertices);
      
      region.collisionModel.isConvex = Matter.Vertices.isConvex(region.collisionModel.vertices);
    }
    
    
    rl.Render = function(region, isClosedLoop, fillColour='#00F') {
      
      // Render transparent background
      context.beginPath();
    
      context.moveTo(region.points[0].x * canvas.width, region.points[0].y * canvas.height);
    
      for (var j = 1; j < region.points.length; ++j) {

        context.lineTo(region.points[j].x * canvas.width, region.points[j].y * canvas.height);
      }
      
      context.closePath();
      
      context.globalAlpha = 0.2;
      context.fillStyle=fillColour;
      context.fill();
      
      context.globalAlpha = 1;
        
        
      // Render line region geometry
              
      if (region.collisionModel.isConvex) {
      
        context.strokeStyle = '#FFF';
        context.fillStyle = '#FFF';
      }
      else {
      
        context.strokeStyle = '#F00';
        context.fillStyle = '#F00';
      }
      
      context.beginPath();
        
      context.moveTo(region.points[0].x * canvas.width, region.points[0].y * canvas.height);

      for (var j = 1; j < region.points.length; ++j) {

        context.lineTo(region.points[j].x * canvas.width, region.points[j].y * canvas.height);
      }
      
      if (isClosedLoop == true) {
      
        context.closePath();
      }
      
      context.lineWidth = 1;
      context.stroke();
      
      
      // Render vertices for the given region
      
      for (var j = 0; j < region.points.length; ++j) {
      
        context.beginPath();
        context.arc(region.points[j].x * canvas.width, region.points[j].y * canvas.height, 5, 0, 2 * Math.PI);
        context.fill();
      }
    }
    
    
    return rl;
    
})((OverDrive.Region || {}), OverDrive.canvas, OverDrive.context);
