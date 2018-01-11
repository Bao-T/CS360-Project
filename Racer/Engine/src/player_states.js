
//
// *** DEPRICATED ***
// Player control functions / states
//


function updatePlayer1(player, deltaTime, env) {
  
  if (system.keyPressed('Q')) {
    
    var F = player.forwardDirection();
    
    player.applyForce(player.mBody.position, { x : F.x * 0.01, y : F.y * 0.01 });
  }
  
  if (system.keyPressed('A')) {
    
    var F = player.forwardDirection();
    
    player.applyForce(player.mBody.position, { x : -F.x * 0.01, y : -F.y * 0.01 });
  }
  
  if (system.keyPressed('Z')) {
    
    Matter.Body.setAngularVelocity(player.mBody, 0);
    player.rotate(-Math.PI * player_rotate_speed);
  }
  
  if (system.keyPressed('X')) {
    
    Matter.Body.setAngularVelocity(player.mBody, 0);
    player.rotate(Math.PI * player_rotate_speed);
  }
  
  
  // Only allow fire when recharge counter = 0
  
  if (system.keyPressed('SPACE') && player.fireRechargeTime<=0) {
  
    // Create new bullet
    var playerDirection = player.forwardDirection();
    
    var newBullet = new Bullet( { pos :  player.mBody.position,
                                  direction : { x : playerDirection.x * projectile_speed, y : playerDirection.y * projectile_speed},
                                  type : env.projectileTypes['player1_bullet'],
                                  owner : player,
                                  postUpdate : function(bullet, deltaTime, env) {
                      
                                                if (bullet.range > 0) {
                                                
                                                  bullet.range = bullet.range - 1;
                                                  
                                                  if (bullet.range==0) {
                                                    
                                                    // Delete bullet instance                  
                                                    Matter.World.remove(system.engine.world, bullet.mBody);
                                                    env.projectileArray.splice(env.projectileArray.indexOf(bullet), 1);
                                                  }
                                                }
                                              } 
                                });
    
    if (newBullet) {
    
      // Add new bullet to matter.js physics system
      Matter.World.add(system.engine.world, [newBullet.mBody]);
  
      // Add new bullet to the main app bullet model
      env.projectileArray.push(newBullet);
    }
    
    player.fireRechargeTime = env.projectileTypes['player1_bullet'].rechargeTime * player.rechargeRate;
    
  }
  
}


function updatePlayer2(player, deltaTime, env) {
  
  if (system.keyPressed('P')) {
    
    var F = player.forwardDirection();
    
    player.applyForce(player.mBody.position, { x : F.x * 0.01, y : F.y * 0.01 });
  }
  
  if (system.keyPressed('L')) {
    
    var F = player.forwardDirection();
    
    player.applyForce(player.mBody.position, { x : -F.x * 0.01, y : -F.y * 0.01 });
  }
  
  if (system.keyPressed('N')) {
    
    Matter.Body.setAngularVelocity(player.mBody, 0);
    player.rotate(-Math.PI * player_rotate_speed);
  }
  
  if (system.keyPressed('M')) {
    
    Matter.Body.setAngularVelocity(player.mBody, 0);
    player.rotate(Math.PI * player_rotate_speed);
  }
  
  
  // Only allow fire when recharge counter = 0
  if (system.keyPressed('RETURN') && player.fireRechargeTime<=0) {
  
    // Create new bullet
    var playerDirection = player.forwardDirection();
    
    var newBullet = new Bullet( { pos :  player.mBody.position,
                                  direction : { x : playerDirection.x * projectile_speed, y : playerDirection.y * projectile_speed},
                                  type : env.projectileTypes['player2_bullet'],
                                  owner : player,
                                  postUpdate : function(bullet, deltaTime, env) {
                      
                                                if (bullet.range > 0) {
                                                
                                                  bullet.range = bullet.range - 1;
                                                  
                                                  if (bullet.range==0) {
                                                    
                                                    // Delete bullet instance                  
                                                    Matter.World.remove(system.engine.world, bullet.mBody);
                                                    env.projectileArray.splice(env.projectileArray.indexOf(bullet), 1);
                                                  }
                                                }
                                              } 
                                } );
    
    if (newBullet) {
    
      // Add new bullet to matter.js physics system
      Matter.World.add(system.engine.world, [newBullet.mBody]);
  
      // Add new bullet to the main app bullet model
      env.projectileArray.push(newBullet);
    }
    
    player.fireRechargeTime = env.projectileTypes['player2_bullet'].rechargeTime * player.rechargeRate;
  }
  
}
