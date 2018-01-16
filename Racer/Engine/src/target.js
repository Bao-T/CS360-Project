// Showing a target
OverDrive.Game = (function (gamelib, canvas, context) {
    gamelib.Target = function () {
        var self = this;

        this.size = { width: 60, height: 60 };
        this.scale = 1;

        this.sprite = new OverDrive.Game.Sprite('Assets/Images/target.png');

        this.draw = function (x, y) {

            context.save();

            context.translate(x, y);
            context.translate(-self.size.width * self.scale / 2, -self.size.height * self.scale / 2);
            self.sprite.draw(0, 0, self.scale);

            context.restore();
        }

        this.drawBoundingVolume = function () {

            // Record path of mBody geometry
            context.beginPath();

            var vertices = self.mBody.vertices;

            context.moveTo(vertices[0].x, vertices[0].y);

            for (var j = 1; j < vertices.length; ++j) {

                context.lineTo(vertices[j].x, vertices[j].y);
            }

            context.lineTo(vertices[0].x, vertices[0].y);

            // Render geometry
            context.lineWidth = 1;
            context.strokeStyle = '#FFFFFF';
            context.stroke();
        }


        //
        // Collision interface
        //

        this.doCollision = function (otherBody, env) {

            otherBody.collideWithPickup(this, {

                objA: env.objB,
                objB: env.objA,
                host: env.host
            });
        }

        this.collideWithPlayer = function (player, env) {

            self.type.handler(player);

            // Remove from collections
            Matter.World.remove(OverDrive.Game.system.engine.world, self.mBody);
            env.host.pickupArray.splice(env.host.pickupArray.indexOf(self), 1);
        }

        this.collideWithProjectile = function (otherPickup, env) { }

        this.collideWithPickup = function (otherPickup, env) { }

    };

    return gamelib;

})((OverDrive.Game || {}), OverDrive.canvas, OverDrive.context);
