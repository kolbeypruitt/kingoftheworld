function Ship3(myId, game, ship, x, y) {
  Ship.call(this, myId, game, ship)
  this.health = 100;
  this.fireRate = 600;
  this.specialDelay = 2000;
  this.shipType = 'ship3'
  this.ship = game.add.sprite(x, y, 'ship3');
  this.ship.animations.add('engines', [1, 2], 20, true);
  this.ship.animations.add('off', [0], 20, true);
  this.ship.anchor.set(0.5);
  this.ship.id = myId;
  game.physics.enable(this.ship, Phaser.Physics.ARCADE);
  this.ship.body.immovable = false;
  this.ship.body.drag.setTo(40);
  this.ship.body.maxVelocity.setTo(220);
  this.ship.body.bounce.setTo(0, 0);
  this.ship.angle = -90;
  // setSize does not work with rotation
  // this.ship.body.setSize(40, 15, 20, 15);
  this.bullets = game.add.group();
  this.bullets.enableBody = true;
  this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
  this.bullets.createMultiple(20, 'bullet3', 0, false);
  this.bullets.setAll('anchor.x', 0.5);
  this.bullets.setAll('anchor.y', 0.5);
  this.bullets.setAll('outOfBoundsKill', true);
  this.bullets.setAll('checkWorldBounds', true);
  game.physics.arcade.velocityFromRotation(this.ship.rotation, 0, this.ship.body.velocity);
}
Ship3.prototype = Object.create(Ship.prototype);
Ship3.prototype.constructor = Ship3;
Ship3.prototype.update = function(shipType) {
  var inputChanged = (
    this.cursor.left != this.input.left ||
    this.cursor.right != this.input.right ||
    this.cursor.up != this.input.up ||
    this.cursor.down != this.input.down ||
    this.cursor.fire != this.input.fire
  );
  if (inputChanged || newLogin === true)
  {
    //Handle input change here
    //send new values to the server   
    if (this.ship.id == myId)
    {
      // send latest valid state to the server
      this.input.x = this.ship.x;
      this.input.y = this.ship.y;
      this.input.angle = this.ship.angle;
      this.input.alive = this.ship.alive;
      this.input.shipType = this.shipType;
      eurecaServer.handleKeys(this.input);
      newLogin = false    
    }
  }

  if (this.cursor.left)
  {
    this.ship.angle -= 1.5;
  }

  else if (this.cursor.right)
  {
    this.ship.angle += 1.5;
  }

  if (this.cursor.up)
  {
    // If statement doesn't work as play appears to be asynch
    // if(!game.add.audio('thrust3').isPlaying)
    game.add.audio('thrust3').play('', 0, .2, false, false)
    this.ship.animations.play('engines')
    this.ship.body.velocity.x += Math.cos(this.ship.rotation)*3
    this.ship.body.velocity.y += Math.sin(this.ship.rotation)*3
  }
  if(!this.cursor.up){
    this.ship.animations.play('off')
  }

  if (this.cursor.down)
  {
    if(this.game.time.now > this.nextSpecial){
      // this.ship.angle += 180
      // this.nextSpecial = this.game.time.now + this.specialDelay
    }
  }

  if (this.cursor.fire)
  { 
    this.fire({x:this.cursor.tx, y:this.cursor.ty});
  }
  // The *.8 creates a parallax scrolling effect
  land.tilePosition.x = -game.camera.x*.8;
  land.tilePosition.y = -game.camera.y*.8;  

  if(this.cursor.up) slideDirection = this.ship.rotation
  
  if (this.currentSpeed > 0)
  {
    game.physics.arcade.velocityFromRotation(slideDirection, this.currentSpeed, this.ship.body.velocity);
  }
  // Prevent this ship from hitting world boundaries
  game.world.wrap(this.ship)
};
Ship3.prototype.fire = function(target) {
    if (!this.alive) return;
    // This function takes bullets from the extinct bullet pool, sets them to ship location and fires them.
    if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
    {
      game.add.audio('fire3').play()
      this.nextFire = this.game.time.now + this.fireRate;
      
      // For this ship I grab two bullets and use math to position them on either side of 
      // the ship and toward the front, then fire them.
      var bullet1 = this.bullets.getFirstDead();
      bullet1.bringToTop();
      bullet1.reset(
        this.ship.x + Math.cos(this.ship.rotation)*35 +Math.sin(this.ship.rotation)*40,
        this.ship.y + Math.sin(this.ship.rotation)*35 -Math.cos(this.ship.rotation)*40
      );
      bullet1.rotation = this.ship.rotation;
      game.physics.arcade.velocityFromRotation(this.ship.rotation, 1000, bullet1.body.velocity);
      setTimeout(function(){bullet1.kill()},800);
      
      var bullet2 = this.bullets.getFirstDead();
      bullet2.bringToTop()
      bullet2.reset(
        this.ship.x + Math.cos(this.ship.rotation)*35 -Math.sin(this.ship.rotation)*40,
        this.ship.y + Math.sin(this.ship.rotation)*35 +Math.cos(this.ship.rotation)*40
      );
      bullet2.rotation = this.ship.rotation;
      game.physics.arcade.velocityFromRotation(this.ship.rotation, 1000, bullet2.body.velocity);
      setTimeout(function(){bullet2.kill()},800)

    }
}