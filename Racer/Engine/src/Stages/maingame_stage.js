
OverDrive.Game = (function(gamelib, canvas, context) {
  
  gamelib.InputMode = { Keyboard : 0, Gamepad : 1 };

  gamelib.CameraMode = { Test : 0, Normal : 1, Fixed : 2 };
  gamelib.cameraWindowScale = 5;
  
  // Model orthographic projection camera that follows players around the canvas.  The aspect ratio of the camera IS ALWAYS THE SAME as the aspect ratio of the canvas.
  gamelib.OrthoCamera = function(initMode) {
  
    var self = this;
    
    this.pos = { x : canvas.width / 2, y : canvas.height / 2};
    this.width = canvas.width;
    this.height = canvas.height;
    
    this.mode = initMode;
    
    
    this.calculateCameraWindow = function(player1, player2) {
    
      // apply transfer function to save player distance to camera window extent
      var fn = function(x) {
        
        //return x * gamelib.cameraWindowScale; // linear
        
        // Exponential window scale decay
        const sigma = 0.0025;//0.005;
        const phi = 2.5;
        return (1 / Math.exp(x * sigma) * phi + 1) * x;
      }
      
      // The position of the camera depends on (i) the average player position (calculated in preCalculatePosition) and (ii) their distance apart (which also determines the camera window).  The reason this is the case is that the camera window cannot fall outside the canvas coordinate area.
      // Note: self.pos is in an intermediate state after calling this function.
      var preCalculatePosition = function(player1, player2) {
        
        self.pos.x = (player1.mBody.position.x + player2.mBody.position.x) / 2;
        self.pos.y = (player1.mBody.position.y + player2.mBody.position.y) / 2;
      }
      
      var calculateWindowExtent = function(player1, player2) {
        
        var dx = Math.abs(player1.mBody.position.x - player2.mBody.position.x);
        var dy = Math.abs(player1.mBody.position.y - player2.mBody.position.y);
        
        //var dist = Math.max(dx, dy);
        var dist = Math.sqrt(dx * dx + dy * dy);
        
        self.width = Math.min(canvas.width, Math.max(300, fn(dist)));
        
        self.height = self.width * (canvas.height / canvas.width);
      }
      
      if (player1.mBody && player2.mBody) {
          
        preCalculatePosition(player1, player2);
        calculateWindowExtent(player1, player2);
        
        // Now calculate final position, ensuring camera window does not extend beyond the canvas
        if (self.pos.x - (self.width / 2) < 0) {
          
          self.pos.x = self.width / 2;
        }
        else if (self.pos.x + (self.width / 2) >= canvas.width) {
          
          self.pos.x = canvas.width - (self.width / 2);
        }
        
        if (self.pos.y - (self.height / 2) < 0) {
          
          self.pos.y = self.height / 2;
        }
        else if (self.pos.y + (self.height / 2) >= canvas.height) {
          
          self.pos.y = canvas.height - (self.height / 2);
        }
      }
    }
    
    this.drawTestWindow = function() {
      
      if (self.mode == gamelib.CameraMode.Test) {
        
        context.beginPath();

        context.moveTo(self.pos.x - self.width / 2, self.pos.y - self.height / 2);
        context.lineTo(self.pos.x + self.width / 2, self.pos.y - self.height / 2);
        context.lineTo(self.pos.x + self.width / 2, self.pos.y + self.height / 2);
        context.lineTo(self.pos.x - self.width / 2, self.pos.y + self.height / 2);
        
        context.closePath();
            
        context.lineWidth = 1;
        context.strokeStyle = '#FFF';
        context.stroke();
      }
    }
  }
  
  
  return gamelib;
  
})((OverDrive.Game || {}), OverDrive.canvas, OverDrive.context);


OverDrive.Stages.MainGame = (function(stage, canvas, context) {
  
  // Private API
  
  let overdrive = OverDrive.Game.system;
  let tracks = OverDrive.Game.tracks;
  let scenery = OverDrive.Game.scenery;

  
  let lapsToWin = 1;
  var level = 2;
  
  //
  // Public interface
  //
  
  // Factory method
  
  stage.Create = function() {
    
    return new stage.MainGame();
  }
  
  
  stage.MainGame = function() {
    
    var self = this;
	
    this.transitionLinks = {
      
      mainMenu : null
    };
    
    this.setTransition = function(id, target) {
      
      self.transitionLinks[id] = target;
    }
    
    // Exit transition state (picked up by leaveStage)
    this.leaveState = {
      
      id : null,
      params : null
    };
	//Decides which player can move.
    var turn = 1;
    // Main game-state specific variables
    
    this.trackIndex = 0;
    
    this.backgroundImage = null;
    
    this.orthoCamera = null;
    
    this.keyDown = null;
    this.mouseButton = false;
    this.mousePositions = null; //array of {x, y, timestamp} objects, to calculate speed
    this.newSwing = false;

    this.raceStarted = false;
    
    this.paused = false; // show paused menu
    this.levelComplete = false;
    this.winner = null;
    
    this.regions = null; // track regions
    this.sceneryRegions = null;
    
    this.baseTime = 0;
    this.lapTime = 0;
    
    this.pickupTypes = null; // Pickup TYPES
    this.pickupArray = null; // Pickup INSTANCES
    this.target = new OverDrive.Game.Target();
    
    //
    // Stage interface implementation
    //
    
    // Pre-start stage with relevant parameters
    // Not called for initial state!
    this.preTransition = function(params) {
      
      self.level = level;
      self.trackIndex = level - 1;
        
      
      console.log('entering level ' + self.level);
    }
    
    this.init = function() {

      // Setup keyboard
      if (self.keyDown === null) {
      
        self.keyDown = new Array(256);
      }
      
      for (var i=0; i<256; ++i) {
          
        self.keyDown[i] = false;
      }

      if (self.mousePositions === null) {
          self.mousePositions = new Array();
      }
      
      $(document).on('keyup', self.onKeyUp);
      $(document).on('keydown', self.onKeyDown);
      $(document).mousemove(self.onMouseMove);
      $(document).mousedown(self.onMouseDown);
      $(document).mouseup(self.onMouseUp);
      
      var track = tracks[level - 1];
      
      
      // Call front-end method to setup key elements of game environment
	  self.setup();
      self.path = new OverDrive.Game.Path(self.regions, overdrive.engine.world, lapsToWin);
      
      self.player1.pathLocation = self.path.initPathPlacement();
      self.player2.pathLocation = self.path.initPathPlacement();
      
      
      // Setup gravity configuration for this stage
      OverDrive.Game.system.engine.world.gravity.y = 0;
      
      
      // Add bounds so you cannot go off the screen
      var b0 = Matter.Bodies.rectangle(-50, canvas.height / 2, 100, canvas.height, { isStatic: true });
      var b1 = Matter.Bodies.rectangle(canvas.width + 50, canvas.height / 2, 100, canvas.height, { isStatic: true });
      var b2 = Matter.Bodies.rectangle(canvas.width / 2, -50, canvas.width, 100, { isStatic: true });
      var b3 = Matter.Bodies.rectangle(canvas.width / 2, canvas.height + 50, canvas.width, 100, { isStatic: true });
      
      b0.collisionFilter.group = 0;
      b0.collisionFilter.category = OverDrive.Game.CollisionModel.StaticScene.Category;
      b0.collisionFilter.mask = OverDrive.Game.CollisionModel.StaticScene.Mask;
      
      b1.collisionFilter.group = 0;
      b1.collisionFilter.category = OverDrive.Game.CollisionModel.StaticScene.Category;
      b1.collisionFilter.mask = OverDrive.Game.CollisionModel.StaticScene.Mask;
      
      b2.collisionFilter.group = 0;
      b2.collisionFilter.category = OverDrive.Game.CollisionModel.StaticScene.Category;
      b2.collisionFilter.mask = OverDrive.Game.CollisionModel.StaticScene.Mask;
      
      b3.collisionFilter.group = 0;
      b3.collisionFilter.category = OverDrive.Game.CollisionModel.StaticScene.Category;
      b3.collisionFilter.mask = OverDrive.Game.CollisionModel.StaticScene.Mask;
      
      Matter.World.add(OverDrive.Game.system.engine.world, [b0, b1, b2, b3]);
      
      
      // Register on-collision event
      Matter.Events.on(OverDrive.Game.system.engine, 'collisionStart', function(event) {
      
        let pairs = event.pairs;
        
        for (var i=0; i<pairs.length; ++i) {
          
          if (pairs[i].bodyA.hostObject !== undefined &&
              pairs[i].bodyB.hostObject !== undefined) {
          
            pairs[i].bodyA.hostObject.doCollision(
              pairs[i].bodyB.hostObject,
              {
                objA : pairs[i].bodyA,
                objB : pairs[i].bodyB,
                host : self // host environment
              }
            ); // objA === collider of first dispatch responder
          }
        }
      });
      
      
      // Register pre-update call (handle app-specific stuff)
      Matter.Events.on(OverDrive.Game.system.engine, 'beforeUpdate', function(event) {
      
        var world = event.source.world;
        
        for (var i=0; i < world.bodies.length; ++i) {
        
          if (world.bodies[i].hostObject !== undefined &&
              world.bodies[i].hostObject.preUpdate !== undefined) {
            
            world.bodies[i].hostObject.preUpdate(world.bodies[i].hostObject, OverDrive.Game.system.gameClock.deltaTime, self);
          }
        };
      });
      
      
      // Register post-update call (handle app-specific stuff)
      Matter.Events.on(OverDrive.Game.system.engine, 'afterUpdate', function(event) {
      
        var world = event.source.world;
        
        for (var i=0; i < world.bodies.length; ++i) {
        
          if (world.bodies[i].hostObject !== undefined &&
              world.bodies[i].hostObject.postUpdate !== undefined) {
          
            world.bodies[i].hostObject.postUpdate(world.bodies[i].hostObject, OverDrive.Game.system.gameClock.deltaTime, self);
          }
        };
      }); 
      
      
      // Register pickups
      self.pickupTypes = [];
      self.pickupArray = [];
      self.pickup_timer = pickup_time_delay;
      
      self.pickupTypes['points_pickup'] = new OverDrive.Pickup.PickupType(
      {
        spriteURI : 'Assets//Images//coin1.png',
        collisionGroup : 0,
        handler : function(collector) {
        
          collector.addPoints(0);
        }
      } );
      
      self.pickupTypes['points_pickup2'] = new OverDrive.Pickup.PickupType(
      {
        spriteURI : 'Assets//Images//coin2.png',
        collisionGroup : 0,
        handler : function(collector) {
        
          collector.addPoints(0);
        }
      });

      self.countDownSecondsElapsed = 0;
      overdrive.gameClock.tick();
      
      self.raceStarted = false;
      
      window.requestAnimationFrame(self.phaseInLoop);
    }

    this.getDist = function (p1, p2) {
        //simple math distance function
        var xdist = p1.x - p2.x;
        var ydist = p1.y - p2.y;
        return (Math.sqrt((xdist * xdist) + (ydist * ydist)))
    }

    this.getStartSwingPos = function () {
        //need at least two points to calculate distances
        if (self.mousePositions !== null && self.mousePositions.length > 1) {
            //hold onto initial mouse down
            var i = self.mousePositions.length - 1;
            var lastPos = self.mousePositions[i];
            var dist = 0;
            var done = false;
            //go through all mouse points, starting at the end. Find the
            // point where the distance from that initial mouse down
            // is largest. We'll call that the start of the swing.
            while (!done) {
                var i = i - 1;
                if (i === -1)
                    break;
                var currPos = self.mousePositions[i];
                var dtmp = self.getDist(lastPos, currPos);
                if (dist <= dtmp)
                    dist = dtmp;
                else
                    done = true;
            }
            return i + 1;
        }
        else
            return 0;
    }

    this.getStartSwing = function () {
        if (self.mousePositions !== null && self.mousePositions.length > 1)
            return self.mousePositions[self.getStartSwingPos()];
        else
            return { x: 0, y: 0, ts: overdrive.gameClock.actualTimeElapsed() };
    }

    this.getEndSwing = function () {
        if (self.mousePositions !== null && self.mousePositions.length !== 0) {
            //starting from the position of the start of the swing, find the mouse point
            // that is closest to the initial mouse point to determine when the putter
            // hits the ball
            var s = self.getStartSwingPos();
            var firstp = self.mousePositions[0];
            var dist = self.getDist(self.mousePositions[s], firstp);
            var done = false;
            while (!done) {
                s = s + 1;
                if (s == self.mousePositions.length)
                    break;
                var dtmp = self.getDist(self.mousePositions[s], firstp);
                done = dtmp > dist;
            }
            return self.mousePositions[s - 1];
        }
        else
            return { x: 0, y: 0, ts: overdrive.gameClock.actualTimeElapsed() };
    }

    this.getMouseDown = function () {
        //public function to check if the mouse is up or down
        return self.mouseButton;
    }

    stage.MainGame.prototype.getMouseDown = this.getMouseDown

    //Are we currently in a swing?
    this.isInNewSwing = function () {
        return self.mouseButton && this.mousePositions.length > 0;
    }

    this.getFirstSwing = function () {
        if (this.mousePositions.length > 0)
            return this.mousePositions[0];
        else
            return { x: 0, y: 0, ts: overdrive.gameClock.actualTimeElapsed() };
    }

    //Has there been a new swing since the last time we checked?
    this.hasNewSwing = function () {
        return self.newSwing;
    }

    //We're done with this swing. Reset.
    this.resetSwing = function () {
        self.newSwing = false;
		
    }

    this.getLastMousePos = function () {
        //public function to get the last mouse position for a swing
        if (self.mousePositions !== null && self.mousePositions.length !== 0) {
            var c = self.mousePositions.length - 1;
            return self.mousePositions[c];
        }
        else
            return { x: 0, y: 0, ts: overdrive.gameClock.actualTimeElapsed() };
    }

    stage.MainGame.prototype.getLastMousePos = this.getLastMousePos

    this.getLastVelocity = function () {
        //public function to get mouse velocity from last swing
        if (self.mousePositions !== null && self.mousePositions.length > 1 && self.mouseButton == false) {
            var sp = self.getStartSwing();
            var ep = self.getEndSwing();
            if (ep.ts == sp.ts) {
                //special case for "push" putt
                sp = self.mousePositions[0];
                ep = self.mousePositions[self.mousePositions.length - 1];
            }
            var dist = self.getDist(sp, ep);
            return (dist / (ep.ts - sp.ts));
        }
        else
            return 0;
    }

    stage.MainGame.prototype.getLastVelocity = this.getLastVelocity

    this.getLastError = function () {
        //public function to get the distance from the mouse down point to the end of the swing
        if (self.mousePositions !== null && self.mousePositions.length > 1) {
            var sp = self.mousePositions[0];
            var ep = self.getEndSwing();
            if (ep.ts == sp.ts)
                return 100; //arbitrary error for "push" putt
            else
                return self.getDist(sp, ep);
        }
        else
            return -1000;
    }

    stage.MainGame.prototype.getLastError = this.getLastError

    this.phaseInLoop = function() {
      
      // Update clock
      overdrive.gameClock.tick();
      
      var secondsDelta = overdrive.gameClock.convertTimeIntervalToSeconds(overdrive.gameClock.deltaTime);
      
      self.countDownSecondsElapsed += secondsDelta;
      
 
      // Redraw scene
      self.renderMainScene();
      
      // Draw countdown
      context.fillStyle = '#FFF';
      context.font = '50pt Impact';
    
      var timeToDisplay = 3 - Math.floor(self.countDownSecondsElapsed);
      var textMetrics = context.measureText(timeToDisplay);
      
      context.fillText(timeToDisplay, canvas.width * 0.5 - textMetrics.width / 2, 300);
    
      // Draw Status
      OverDrive.Game.drawHUD(self.player1, self.player2, false, self.lapTime, self.path.maxIterations);

      // Iterate through countdown
      if (self.countDownSecondsElapsed<3) {
        
        window.requestAnimationFrame(self.phaseInLoop);
      }
      else {
      
        // Reset clock base time and goto main game loop
        
        self.paused = false;
        self.levelComplete = false;
    
        self.baseTime = overdrive.gameClock.gameTimeElapsed();
        self.lapTime = 0;
        
        self.raceStarted = true;
        
        window.requestAnimationFrame(self.mainLoopActual);
      }
    }
    
    this.mainLoopActual = function() {
      
      // Manage pickups
      let pickupStatus = OverDrive.Pickup.processPickups(
        self.pickupTypes,
        overdrive.engine,
        self.pickup_timer,
        overdrive.gameClock.convertTimeIntervalToSeconds(overdrive.gameClock.deltaTime),
        self.regions);
      
      self.pickup_timer = pickupStatus.timer;
      
      if (pickupStatus.newPickup) {
      
        Matter.World.add(overdrive.engine.world, [pickupStatus.newPickup.mBody]); 
        self.pickupArray.push(pickupStatus.newPickup);
      }
    
    
      self.mainLoop();
    }
    
    this.initPhaseOut = function() {
      
      // Add 200 points for winner
      self.winner.score += 200;
      
      self.winnerMessage = self.winner.pid + ' Wins!!!!!';
      
      window.requestAnimationFrame(self.phaseOutLoop);
    }
    
    this.phaseOutLoop = function() {
      
      // Update system clock
      OverDrive.Game.system.gameClock.tick();
      
      self.lapTime = overdrive.gameClock.gameTimeElapsed() - self.baseTime;
            
      // Update main physics engine state
      Matter.Engine.update(overdrive.engine, overdrive.gameClock.deltaTime);
      
      self.renderMainScene();
      
      // Draw winner message
      //context.fillStyle = '#FFF';
      //context.font = '50pt Amatic SC';
      //var textMetrics = context.measureText(self.winnerMessage);
      //context.fillText(self.winnerMessage, canvas.width * 0.5 - textMetrics.width / 2, 300);
      
        
        window.requestAnimationFrame(self.leaveStage);
     
    }
    
    this.leaveStage = function() {
    
      // Add to leaderboard
      overdrive.scores.push({name : self.winner.pid, score : self.winner.score});
      overdrive.sortScores();
      
      
      // Tear-down stage
      $(document).on('keyup', self.onKeyUp);
      $(document).on('keydown', self.onKeyDown);
      $(document).mousemove(self.onMouseMove);
      $(document).mousedown(self.onMouseDown);
      $(document).mouseup(self.onMouseUp);

      Matter.Events.off(OverDrive.Game.system.engine);
      
      Matter.World.clear(overdrive.engine.world, false);
      
      self.backgroundImage = null;
    
      self.orthoCamera = null;
    
      self.gamepads = {};

      self.paused = false; // show paused menu
      self.levelComplete = false;
      self.winner = null;
    
      self.regions = null; // track regions
      self.sceneryRegions = null;
    
      self.baseTime = 0;
      self.lapTime = 0;
    
      self.pickupTypes = null;
      self.pickupArray = null;
    
      // Setup leave state parameters and target - this is explicit!
      self.leaveState.id = 'mainMenu';
      self.leaveState.params = {}; // params setup as required by target state
      
      
      var target = self.transitionLinks[self.leaveState.id];
      
      // Handle pre-transition (in target, not here! - encapsulation!)
      target.preTransition(self.leaveState.params);

      // Final transition from current stage
      window.requestAnimationFrame(target.init);
      
      // Clear leave state once done
      self.leaveState.id = null;
      self.leaveState.params = null;
    }
    

    // Event handling functions
    
    this.onKeyDown = function(event) {
      
      self.keyDown[event.keyCode] = true;
    }
    
    this.onKeyUp = function(event) {
      
      self.keyDown[event.keyCode] = false;
    }

    this.onMouseDown = function (event) {
        self.mousePositions.length = 0;
        self.newSwing = false;
        self.mouseButton = true;
    }

    this.onMouseUp = function (event) {
        if (self.mouseButton && self.mousePositions.length > 1)
            //If the mousePositions array has multiple points, we have a new swing.
            self.newSwing = true;
        self.mouseButton = false;
    }

    this.onMouseMove = function (event) {
        //only track mouse movement if the button is down.
        if (self.mouseButton) {
            self.mousePositions.push({ x: event.pageX, y: event.pageY, ts: overdrive.gameClock.actualTimeElapsed() });
        }
    }
    
    
    // Stage processing functions
    
    this.renderMainScene = function() {
      
      // Update camera
      self.orthoCamera.calculateCameraWindow(self.player1, self.player2);
      
      if (self.orthoCamera.mode == OverDrive.Game.CameraMode.Normal) {
      
        context.save();
      
        context.scale(canvas.width / self.orthoCamera.width, canvas.height / self.orthoCamera.height);
        context.translate(-(self.orthoCamera.pos.x - (self.orthoCamera.width / 2)),
                        -(self.orthoCamera.pos.y - (self.orthoCamera.height / 2)));
      }
      
      
      // Render latest frame
      self.drawLevel();

      
      if (self.orthoCamera.mode == OverDrive.Game.CameraMode.Normal) {
      
        context.restore();
      }
      else if (self.orthoCamera.mode == OverDrive.Game.CameraMode.Test) {
      
        self.orthoCamera.drawTestWindow();
      }
    }
    
    
    this.drawLevel = function() {

      // Draw background        
      if (self.backgroundImage) {
    
        self.backgroundImage.draw();
      }

      // Draw player1
      if (self.player1) {
      
        self.player1.draw();
        //self.player1.drawBoundingVolume('#FFF');
      }
    
      // Draw player2
      if (self.player2) {
    
        self.player2.draw();
        //self.player2.drawBoundingVolume('#FFF');
      }

      if (self.isInNewSwing()) {
          self.target.draw(this.mousePositions[0].x, this.mousePositions[0].y);
      }


      // Render pickups
      OverDrive.Game.drawObjects(self.pickupArray);
    }
    
    
    // Return true if any key is pressed at the time the function is called
    this.keyPressed = function(keyCode) {
    
      return this.keyDown[overdrive.Keys[keyCode]];
    }
    
    
    this.updatePlayer1 = function(player, deltaTime, env) {
      
      // Limit player velocity
      if (player.mBody.speed > player_top_speed) {
        
        var vel = Matter.Vector.normalise(player.mBody.velocity);
        
        vel.x *= player_top_speed;
        vel.y *= player_top_speed;
        
        Matter.Body.setVelocity(player.mBody, vel);
      }
      
      const p1InputMethod = overdrive.settings.players[0].mode;
      
      if (p1InputMethod == OverDrive.Game.InputMode.Keyboard) {
        
        // Keyboard input
        if (turn == 1){
			if (this.hasNewSwing()) {
			  
			  var F = player.forwardDirection();

				player.applyForce(player.mBody.position, { x : F.x * this.getLastVelocity()*0.00001, y : F.y * this.getLastVelocity()*0.00001 });
				player.score = player.score +1;
				this.resetSwing();
				turn = 2;
				if (level != 1){
					level = 1;
					this.preTransition();
					}
				//this.renderMainScene();
				
				
				
				
				
				
				
			  //player.applyForce(player.mBody.position, { x : F.x * player.forwardForce, y : F.y * player.forwardForce });
			}
			if (this.keyPressed(overdrive.settings.players[0].keys.left)) {
			  
			  Matter.Body.setAngularVelocity(player.mBody, 0);
			  player.rotate((-Math.PI/180) * player.rotateSpeed * (deltaTime/1000));
			}
			
			if (this.keyPressed(overdrive.settings.players[0].keys.right)) {
			  
			  Matter.Body.setAngularVelocity(player.mBody, 0);
			  player.rotate((Math.PI/180) * player.rotateSpeed * (deltaTime/1000));
			  
			}
		}
	  }
      
      
    }


    this.updatePlayer2 = function(player, deltaTime, env) {
      
      // Limit player velocity
      if (player.mBody.speed > player_top_speed) {
        
        var vel = Matter.Vector.normalise(player.mBody.velocity);
        
        vel.x *= player_top_speed;
        vel.y *= player_top_speed;
        
        Matter.Body.setVelocity(player.mBody, vel);
      }
      
      const inputMethod = overdrive.settings.players[1].mode;
      
      if (inputMethod == OverDrive.Game.InputMode.Keyboard) {
      
        if (turn == 2){
			if (this.hasNewSwing()) {
			  
			  var F = player.forwardDirection();

				player.applyForce(player.mBody.position, { x : F.x * this.getLastVelocity()*0.00001, y : F.y * this.getLastVelocity()*0.00001 });
				player.score = player.score +1;
				this.resetSwing();
				turn = 1;
				
				
				
			  //player.applyForce(player.mBody.position, { x : F.x * player.forwardForce, y : F.y * player.forwardForce });
			}
			if (this.keyPressed(overdrive.settings.players[0].keys.left)) {
			  
			  Matter.Body.setAngularVelocity(player.mBody, 0);
			  player.rotate((-Math.PI/180) * player.rotateSpeed * (deltaTime/1000));
			}
			
			if (this.keyPressed(overdrive.settings.players[0].keys.right)) {
			  
			  Matter.Body.setAngularVelocity(player.mBody, 0);
			  player.rotate((Math.PI/180) * player.rotateSpeed * (deltaTime/1000));
			}
		}
      }
    }
    
    
    // Controller input handlers
    this.handleGamepadInput = function(player, playerIndex, deltaTime) {
      
      const gamepadIndex = overdrive.Gamepad.bindings[playerIndex].gamepadIndex;
      
      // Ensure still connected
      var pad = overdrive.Gamepad.gamepads[gamepadIndex];
      
      if (pad && pad.connected) {
        
        if (pad.buttons[0].pressed) {
          
          var F = player.forwardDirection();
          
          player.applyForce(player.mBody.position, { x : F.x * player.forwardForce, y : F.y * player.forwardForce });
        }
        
        if (pad.buttons[1].pressed) {
          
          var F = player.forwardDirection();
          
          player.applyForce(player.mBody.position, { x : -F.x * player.forwardForce * 0.25, y : -F.y * player.forwardForce *0.25 }); // scale reverse force
        }
        
        // Calculate turn as a continuous function of pad.axes[0]
        Matter.Body.setAngularVelocity(player.mBody, 0);
        
        if (Math.abs(pad.axes[0]) > 0.1) {
        
          player.rotate((Math.PI/180) * player.rotateSpeed * pad.axes[0] * (deltaTime / 1000));
        }
      }
    }
    
    
  };
  
  
  return stage;
  
})((OverDrive.Stages.MainGame || {}), OverDrive.canvas, OverDrive.context);

