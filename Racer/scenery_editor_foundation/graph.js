
OverDrive.Graph = (function(g, canvas, context) {  
  
  g.EdgeMatch = function(ei, ej) {
  
    let fEqual = OverDrive.MetLib.fEqual;
    
    return (fEqual(ei.p1.x, ej.p1.x) && fEqual(ei.p1.y, ej.p1.y)) && (fEqual(ei.p2.x, ej.p2.x) && fEqual(ei.p2.y, ej.p2.y));
  }
  
  
  // Clear the graph for all regions in R
  g.ClearGraph = function(R) {
  
    for (var i = 0; i < R.length; ++i) {
    
      R[i].graph = [];
    }
  }
  
  
  // Build a new connection graph from scratch for region Ri, Rj (j > i) in R
  g.BuildGraph = function(R) {
  
    g.ClearGraph(R);
    
    // Iterate through each region (excluding the last region)
    for (var i=0; i < R.length-1; ++i) {
    
      let n = R[i].collisionModel.vertices.length;
      
      // Look for regions Rj (j > i) that connect to Ri
      for (var j = i + 1; j < R.length; ++j) {
      
        let m = R[j].collisionModel.vertices.length;
        
        // Iterate through each edge of Ri to see if it connects
        // with any edge of Rj (only interested in first connecting edge)
        
        let connected = false;
        
        for (var k=0; k < n && !connected; ++k) {
      
          let ei = {
            
            p1 : R[i].collisionModel.vertices[k],
            p2 : R[i].collisionModel.vertices[(k < n - 1) ? k + 1 : 0]
          };
          
          // For given edge ei, see if it corresponds with any edge in region Rj
          for (var q = 0; q < m && !connected; ++q) {
          
            let ej = {
            
              p1 : R[j].collisionModel.vertices[(q < m - 1) ? q + 1 : 0],
              p2 : R[j].collisionModel.vertices[q]
            }
            
            if (g.EdgeMatch(ei, ej)) {
            
              R[i].graph.push( { region : R[j], index : j } );
              connected = true;
            }
          }
        }
      }
    }
  }
  
  
  // Extend graph from existing regions [R] to region Rj.  This does not build a new graph, but extends
  // any existing graph with Rj considered in the region set.  A link is made Ri -> Rj where i < j.
  g.AugmentGraph = function(R, Rj) {
  
    const m = Rj.collisionModel.vertices.length;
    
    // Iterate through each region
    for (var i=0; i < R.length; ++i) {
    
      let connected = false;
      
      // Get number of points in region Ri
      let n = R[i].collisionModel.vertices.length;
      
      // Iterate through each edge for region Ri
      for (var k=0; k < n && !connected; ++k) {
      
        let ei = {
          
          p1 : R[i].collisionModel.vertices[k],
          p2 : R[i].collisionModel.vertices[(k < n - 1) ? k + 1 : 0]
        };
        
        // For given edge ei, see if it corresponds with any edge in region Rj
        for (var q = 0; q < m && !connected; ++q) {
        
          let ej = {
          
            p1 : Rj.collisionModel.vertices[(q < m - 1) ? q + 1 : 0],
            p2 : Rj.collisionModel.vertices[q]
          }
          
          if (g.EdgeMatch(ei, ej)) {
          
            R[i].graph.push( { region : R[j], index : j } );
            connected = true;
          }
        }
      }
    }
  }
  
  
  g.Render = function(R) {
  
    // Specify connecting arc using polar model (pos, theta, length).  These are specified in pixel, not normalised coordiantes
    var drawDirectedArc = function(pos, theta, length, lineWidth = 1, style = '#FF0') {
    
      context.save();
        
      context.translate(pos.x, pos.y);
      context.rotate(theta);
      
      // Draw main arc
      context.beginPath();
      
      context.moveTo(0, 0);
      context.lineTo(length, 0);
          
      context.strokeStyle = style;
      context.lineWidth = lineWidth;
      
      context.stroke();
      
      // Draw arrow showing direction of arc
      context.beginPath();
      
      context.moveTo(length, 0);
      context.lineTo(length - 10, -3);
      context.lineTo(length - 10, 3);
      context.closePath();
      
      context.fillStyle = style;
      context.fill();
      
      context.restore();
    }
    
    var setupDirectedArc = function(Ri, Rj) {
      
      // Directed arc ci -> cj
      let ci = Matter.Vertices.centre(Ri.collisionModel.vertices);
      let cj = Matter.Vertices.centre(Rj.collisionModel.vertices);
      
      let pos = { x : ci.x * canvas.width, y : ci.y * canvas.height };
      let pos_j = { x : cj.x * canvas.width, y : cj.y * canvas.height };
      
      let dx = pos_j.x - pos.x;
      let dy = pos_j.y - pos.y;
      
      let theta = Math.atan2(dy, dx);
                    
      let length = Math.sqrt((dx * dx) + (dy * dy));
      
      drawDirectedArc(pos, theta, length);
    }
    
    // Deal with R[0] differently as this can only have 2 connected regions (see notes)
    if (R.length > 0 && R[0].graph.length > 0) {
    
      // For R[0] only graph[0] (out) and graph[1] (return) are relevant
      setupDirectedArc(R[0], R[0].graph[0].region);
      
      // The 'return' entry (2nd graph element from the first region) goes TO the first region!
      // Any other node connections from the first region are ignored
      if (R[0].graph.length > 1) {
      
        setupDirectedArc(R[0].graph[1].region, R[0]);
      }
    }
    
    for (var i=1; i < R.length-1; ++i) { // Don't process last region since given Ri->Rj (i<j), the last region will have no links
    
      if (R[i].graph.length > 0) {
      
        // Iterate through each connected region
        for (var j=0; j < R[i].graph.length; ++j) {
        
          setupDirectedArc(R[i], R[i].graph[j].region);
        }
      }
    }
  }
      
      
  return g;
  
})( (OverDrive.Graph || {}), OverDrive.canvas, OverDrive.context );
