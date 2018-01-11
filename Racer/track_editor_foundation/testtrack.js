
OverDrive.Game = (function(gamelib, canvas, context) {
  
  gamelib.InputMode = { Keyboard : 0, Gamepad : 1 };
  
  return gamelib;
  
})((OverDrive.Game || {}), OverDrive.canvas, OverDrive.context);



OverDrive.TestStage = (function(ts, canvas, context) {
  
  ts.CameraMode = { Test : 0, Normal : 1 };
  ts.cameraWindowScale = 5;
  
  // Model orthographic projection camera that follows players around the canvas.  The aspect ratio of the camera IS ALWAYS THE SAME as the aspect ratio of the canvas.
  ts.OrthoCamera = function(initMode) {
  
    var self = this;
    
    this.pos = { x : canvas.width / 2, y : canvas.height / 2};
    this.width = canvas.width;
    this.height = canvas.height;
    
    this.mode = initMode;
    
    
    this.calculateCameraWindow = function(player1, player2) {
    
      // apply transfer function to save player distance to camera window extent
      var fn = function(x) {
        
        //return x * ts.cameraWindowScale; // linear
        
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
      
      if (self.mode == ts.CameraMode.Test) {
        
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
  
  ts.Test = function() {
    
    var self = this;
  
    this.transitionLinks = {
      
      endtest : null
    };
    
    this.setTransition = function(id, target) {
      
      self.transitionLinks[id] = target;
    }
    
    // Exit transition state (picked up by leaveStage)
    this.leaveState = {
      
      id : null,
      params : null
    };

    
    // Test track state (reflect actual game state as close as possible)
    
    this.editorModel = null; // Actual editor model - other aspects derived from this during init
   
    // Main game-state specific variables
    this.backgroundImage = null;
  
    this.player1 = null;
    this.player2 = null;
    
    this.path = null;
    
    // Main element to test - track path to ensure we can successfully navigate around track and complete laps
    //this.trackPath = null;
  
    this.testComplete = false;
    
    this.orthoCamera = null;
    
    this.keyDown = new Array(256);
    this.gamepads = {};

    
    //
    // Stage interface implementation
    //
    
    // Pre-start stage with relevant parameters
    this.preTransition = function(params) {
      
       this.editorModel = params.model;
    }
    
    this.init = function() {
      
      console.log('test: init');
      
      OverDrive.Game.system = new OverDrive.Game.System();
      
      this.backgroundImage = new OverDrive.Game.Background(this.editorModel.trackImage.imageURL);
      
      this.orthoCamera = new ts.OrthoCamera(ts.CameraMode.Normal);
      
      // Setup players
      this.player1 = new OverDrive.Game.Player( {
                            pid : 'player1',
                            x : this.editorModel.players[0].pos.x * canvas.width,
                            y : this.editorModel.players[0].pos.y * canvas.height,
                            angle : this.editorModel.players[0].angle,
                            scale : this.editorModel.players[0].scale,
                            rotateSpeed : 0.01,
                            forwardForce : 0.005,
                            spriteURI : this.editorModel.players[0].playerImageURI,
                            world : OverDrive.Game.system.engine.world,
                            mass : 20,
                            boundingVolumeScale : 0.75,
                            collisionGroup : -1,
                            preUpdate : function(player, deltaTime, env) {
                            
                              self.updatePlayer1(player, deltaTime, env);
                            },
                            postUpdate : function(player, deltaTime, env) {}
                          } );
                          
      this.player2 = new OverDrive.Game.Player( {
                            pid : 'player2',
                            x : this.editorModel.players[1].pos.x * canvas.width,
                            y : this.editorModel.players[1].pos.y * canvas.height,
                            angle : this.editorModel.players[1].angle,
                            scale : this.editorModel.players[1].scale,
                            rotateSpeed : 0.01,
                            forwardForce : 0.005,
                            spriteURI : this.editorModel.players[1].playerImageURI,
                            world : OverDrive.Game.system.engine.world,
                            mass : 20,
                            boundingVolumeScale : 0.75,
                            collisionGroup : -2,
                            preUpdate : function(player, deltaTime, env) {
                            
                              self.updatePlayer2(player, deltaTime, env);
                            },
                            postUpdate : function(player, deltaTime, env) {}
                          } );
       
      this.path = new OverDrive.Game.Path(this.editorModel.regions, OverDrive.Game.system.engine.world, 3);
      
      this.player1.pathLocation = this.path.initPathPlacement();
      this.player2.pathLocation = this.path.initPathPlacement();
      
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
          
            pairs[i].bodyA.hostObject.doCollision(pairs[i].bodyB.hostObject, { objA : pairs[i].bodyA, objB : pairs[i].bodyB, env : {} }); // objA === collider of first dispatch responder
          }
        }
      });
      
      
      // Register pre-update call (handle app-specific stuff)
      Matter.Events.on(OverDrive.Game.system.engine, 'beforeUpdate', function(event) {
      
        var world = event.source.world;
        
        for (var i=0; i < world.bodies.length; ++i) {
        
          if (world.bodies[i].hostObject !== undefined &&
              world.bodies[i].hostObject.preUpdate !== undefined) {
            
            world.bodies[i].hostObject.preUpdate(world.bodies[i].hostObject, OverDrive.Game.system.gameClock.deltaTime, {});
          }
        };
      });
      
      
      // Register post-update call (handle app-specific stuff)
      Matter.Events.on(OverDrive.Game.system.engine, 'afterUpdate', function(event) {
      
        var world = event.source.world;
        
        for (var i=0; i < world.bodies.length; ++i) {
        
          if (world.bodies[i].hostObject !== undefined &&
              world.bodies[i].hostObject.postUpdate !== undefined) {
          
            world.bodies[i].hostObject.postUpdate(world.bodies[i].hostObject, OverDrive.Game.system.gameClock.deltaTime, {});
          }
        };
      }); 


      // Setup keyboard state and events
      
      // Initialise key flags
      for (i=0; i<256; ++i) { this.keyDown[i] = false; }
      
      // Setup keyboard event handlers
      //document.onkeyup = this.onKeyUp;
      //document.onkeydown = this.onKeyDown;
      $(document).on('keyup', this.onKeyUp);
      $(document).on('keydown', this.onKeyDown);

      
      // Setup gamepad events
      $(window).on('gamepadconnected', this.connectGamepad);
      $(window).on('gamepaddisconnected', this.disconnectGamepad);
      
      
      testComplete = false;
      
      window.requestAnimationFrame(this.mainLoop.bind(this));
    }
        
    this.mainLoop = function() {
            
      // Update system clock
      OverDrive.Game.system.gameClock.tick();
      
      // Update main physics engine state
      Matter.Engine.update(OverDrive.Game.system.engine, OverDrive.Game.system.gameClock.deltaTime);
      
      // Update camera
      this.orthoCamera.calculateCameraWindow(this.player1, this.player2);
      
      if (this.orthoCamera.mode == ts.CameraMode.Normal) {
      
        context.save();
      
        context.scale(canvas.width / this.orthoCamera.width, canvas.height / this.orthoCamera.height);
        context.translate(-(this.orthoCamera.pos.x - (this.orthoCamera.width / 2)),
                        -(this.orthoCamera.pos.y - (this.orthoCamera.height / 2)));
      }
      
      
      // Render latest frame
      this.drawScene();

      if (this.orthoCamera.mode == ts.CameraMode.Normal) {
      
        context.restore();
      }
      else if (this.orthoCamera.mode == ts.CameraMode.Test) {
      
        this.orthoCamera.drawTestWindow();
      }
      
      
      // TEST CODE - ADJUST CAMERA WINDOW EXTENT SCALE FACTOR
      /*
      if (OverDrive.Game.system.keyPressed('UP')) {
        
        ts.cameraWindowScale += 0.5;
        console.log('cameraWindowScale = ' + ts.cameraWindowScale);
      }
      
      if (OverDrive.Game.system.keyPressed('DOWN')) {
        
        ts.cameraWindowScale = Math.max(1, ts.cameraWindowScale - 0.5);
        console.log('cameraWindowScale = ' + ts.cameraWindowScale);
      }
      */
      
      // Check for end of test
      if (this.keyPressed('ESC')) {
        
        this.testComplete = true;
      }

      
      // Repeat gameloop, or start phase-out if end of game condition(s) met
      if (!this.testComplete) {
      
        window.requestAnimationFrame(this.mainLoop.bind(this));
      }
      else {
      
        // Setup leave state parameters and target - this is explicit!
        this.leaveState.id = 'endtest';
        this.leaveState.params = {}; // params setup as required by target state
        
        window.requestAnimationFrame(this.leaveStage.bind(this));
      }
    }
        
    this.leaveStage = function() {
    
      console.log('test: leave');
      
      console.log('explicit entry to editor - handle editor-specific entry');
      
      // Tear-down test-track events
      Matter.Events.off(OverDrive.Game.system.engine);
      $(window).off('gamepadconnected', this.connectGamepad);
      $(window).off('gamepaddisconnected', this.disconnectGamepad);
      document.onkeyup = null;
      document.onkeydown = null;
    
      // Tear-down test environment
      this.editorModel = null;
      this.backgroundImage = null; 
      this.player1 = null;
      this.player2 = null;
      this.path = null;
      //this.trackPath = null;
      this.testComplete = false;
      this.orthoCamera = null;
      this.gamepads = {};
 
 
      var target = this.transitionLinks[this.leaveState.id];
      
      // Handle pre-transition (in target, not here! - encapsulation!)
      target.preTransition(this.leaveState.params);

      // Final transition from current stage
      window.requestAnimationFrame(target.init.bind(target));
      
      // Clear leave state once done
      this.leaveState.id = null;
      this.leaveState.params = null;
    }
    
    
    // Stage processing functions
    
    this.drawScene = function() {

      // Draw background        
      if (this.backgroundImage) {
    
        this.backgroundImage.draw();
      }
    
      // Draw player1
      if (this.player1) {
      
        this.player1.draw();
        this.player1.drawBoundingVolume('#FFFFFF');
      }
    
      // Draw player2
      if (this.player2) {
    
        this.player2.draw();
        this.player2.drawBoundingVolume('#FFFFFF');
      }
          
      
      // Draw Heads-Up-Display showing scores etc.
      //drawHUD(context, this.player1, this.player2);
    }
  
  
    this.updatePlayer1 = function(player, deltaTime, env) {
      
      // Limit player velocity
      if (player.mBody.speed > 2) {
        
        var vel = Matter.Vector.normalise(player.mBody.velocity);
        
        vel.x *= 2;
        vel.y *= 2;
        
        Matter.Body.setVelocity(player.mBody, vel);
      }
      
      // Note: These settings will be determined in setup menu
      //const p1InputMethod = OverDrive.Game.InputMode.Gamepad;
      const p1InputMethod = OverDrive.Game.InputMode.Keyboard;
      
      const p1GamepadIndex = 0;
      
      // Gamepad input
      if (p1InputMethod == OverDrive.Game.InputMode.Gamepad) {
      
        /*
        console.log('connected = ' + gamepad.connected);
        console.log('buttons = ' + gamepad.buttons);
        console.log('axes = ' + gamepad.axes);
        */
        // Ensure still connected
        var p1Pad = gamepads[p1GamepadIndex];
        
        if (p1Pad && p1Pad.connected) {
          
          if (p1Pad.buttons[0].pressed) {
            
            var F = player.forwardDirection();
            
            player.applyForce(player.mBody.position, { x : F.x * player.forwardForce, y : F.y * player.forwardForce });
          }
          
          if (p1Pad.buttons[1].pressed) {
            
            var F = player.forwardDirection();
            
            player.applyForce(player.mBody.position, { x : -F.x * player.forwardForce * 0.25, y : -F.y * player.forwardForce *0.25 }); // scale reverse force
            
            /*
            // Powerslide
            var speed = player.mBody.speed;
            var vel = player.mBody.velocity;
            var velNorm = Matter.Vector.normalise(player.mBody.velocity);
            
            vel.x += -velNorm.x * speed * 0.005;
            vel.y += -velNorm.y * speed * 0.005;
            
            Matter.Body.setVelocity(player.mBody, vel);
            */
          }
          
          // Calculate turn as a continuous function of p1Pad.axes[0]
          Matter.Body.setAngularVelocity(player.mBody, 0);
          
          if (Math.abs(p1Pad.axes[0]) > 0.1) {
          
            player.rotate(Math.PI * player.rotateSpeed * p1Pad.axes[0]);
          }
          
        }
        
      }
      else if (p1InputMethod == OverDrive.Game.InputMode.Keyboard) {
        
        // Keyboard input
        
        if (self.keyPressed('Q')) {
          
          var F = player.forwardDirection();
          
          player.applyForce(player.mBody.position, { x : F.x * player.forwardForce, y : F.y * player.forwardForce });
        }
        
        if (self.keyPressed('A')) {
          
          var F = player.forwardDirection();
          
          player.applyForce(player.mBody.position, { x : -F.x * player.forwardForce, y : -F.y * player.forwardForce });
        }
        
        if (self.keyPressed('Z')) {
          
          Matter.Body.setAngularVelocity(player.mBody, 0);
          player.rotate(-Math.PI * player.rotateSpeed);
        }
        
        if (self.keyPressed('X')) {
          
          Matter.Body.setAngularVelocity(player.mBody, 0);
          player.rotate(Math.PI * player.rotateSpeed);
        }
      }
      
      
    }


    this.updatePlayer2 = function(player, deltaTime, env) {
      
      // Limit player velocity
      if (player.mBody.speed > 2) {
        
        var vel = Matter.Vector.normalise(player.mBody.velocity);
        
        vel.x *= 2;
        vel.y *= 2;
        
        Matter.Body.setVelocity(player.mBody, vel);
      }
      
      if (self.keyPressed('P')) {
        
        var F = player.forwardDirection();
        
        player.applyForce(player.mBody.position, { x : F.x * player.forwardForce, y : F.y * player.forwardForce });
      }
      
      if (self.keyPressed('L')) {
        
        var F = player.forwardDirection();
        
        player.applyForce(player.mBody.position, { x : -F.x * player.forwardForce, y : -F.y * player.forwardForce });
      }
      
      if (self.keyPressed('N')) {
        
        Matter.Body.setAngularVelocity(player.mBody, 0);
        player.rotate(-Math.PI * player.rotateSpeed);
      }
      
      if (self.keyPressed('M')) {
        
        Matter.Body.setAngularVelocity(player.mBody, 0);
        player.rotate(Math.PI * player.rotateSpeed);
      }      
    }
    
    
    // Keyboard API
    
    this.onKeyDown = function(event) {
      
      self.keyDown[event.keyCode] = true;
    }
    
    this.onKeyUp = function(event) {
      
      self.keyDown[event.keyCode] = false;
    }

    this.keyPressed = function(keyCode) {
    
      return self.keyDown[OverDrive.Game.system.Keys[keyCode]];
    }
    
    
    // Gamepad API
    
    this.connectGamepad = function(event) {
      
      var gamepad = event.originalEvent.gamepad;
      
      gamepads[gamepad.index] = gamepad;
      
      console.log('gamepad %d CONNECTED ', gamepad.index);
      
      console.log('id = ' + gamepad.id);
      console.log('mapping = ' + gamepad.mapping);
      console.log('connected = ' + gamepad.connected);
      console.log('buttons = ' + gamepad.buttons);
      console.log('axes = ' + gamepad.axes);
      console.log('timestamp = ' + gamepad.timestamp);
    }
    
    this.disconnectGamepad = function(event) {
      
      var gamepad = event.originalEvent.gamepad;
      
      delete gamepads[gamepad.index];
      
      console.log('gamepad %d removed ', gamepad.index);
    }
    
    
  };
  
  
  return ts;
  
})((OverDrive.TestStage || {}), OverDrive.canvas, OverDrive.context);


OverDrive.TestStage = (function(ts, canvas, context) {
    
  ts.Create = function() {
    
    return new ts.Test();
  }
  
  return ts;
  
})((OverDrive.TestStage || {}), OverDrive.canvas, OverDrive.context);

