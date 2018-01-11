//
// Projectile model
//


// Create new projectile type
function ProjectileType(config) {

  this.strength = config.strength;
  this.mass = config.mass;
  this.range = config.range;
  this.rechargeTime = config.rechargeTime;
  
  this.collisionGroup = config.collisionGroup;
  
  this.sprite = new Sprite(config.spriteURI);
}


// Create new bullet projectile instance - DEPRICATED
function Bullet(config) {
    
  var self = this;
  
  
  this.type = config.type;
	this.owner = config.owner; // Track which player fired the bullet
	
  this.scale = bullet_scale;
    
	this.range = config.type.range; // How long the bullet lasts

	this.mBody = Matter.Bodies.circle(config.pos.x, config.pos.y, config.type.sprite.image.width / 2);
  
  this.mBody.collisionFilter.group = config.type.collisionGroup;
  this.mBody.collisionFilter.category = CollisionModel.Projectile.Category;
  this.mBody.collisionFilter.mask = CollisionModel.Projectile.Mask;
  
  this.mBody.mass = config.type.mass;
  this.mBody.frictionAir = 0;
  Matter.Body.applyForce(this.mBody, config.pos, config.direction);
  
  this.mBody.hostObject = this;
  
  
  // Event handlers for current state
  this.postUpdate = config.postUpdate;
  
  
  
  this.draw = function(context) {
    
    var pos = this.mBody.position;
    
    this.type.sprite.draw(context, pos.x, pos.y, this.scale);
  }

  
  // Collision interface
  
  this.doCollision = function(otherBody, env) {
	  
	  otherBody.collideWithProjectile(this, env);
  }
  
  this.collideWithPlayer = function(player, env) {
    
    player.collideWithProjectile(this, env);
  }
  
  this.collideWithProjectile = function(otherProjectile, env) {
  }
  
  this.collideWithNPC = function(npc, env) {
    
    npc.collideWithProjectile(this, env);
  }
  
}
