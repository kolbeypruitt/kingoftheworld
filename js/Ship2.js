function Ship2(myId, game, ship, x, y) {
  Ship.call(this, myId, game, ship)
  this.health = 40;
  this.fireRate = 10;
  this.specialDelay = 2000;
  this.shipType = 'ship2'
  this.ship = game.add.sprite(x, y, 'ship2');
  this.ship.animations.add('engines', [1, 2], 20, true);
  this.ship.animations.add('off', [0], 20, true);
  this.ship.anchor.set(0.5);
  this.ship.id = myId;
  game.physics.enable(this.ship, Phaser.Physics.ARCADE);
  this.ship.body.immovable = false;
  this.ship.body.drag.setTo(5000);
  this.ship.body.bounce.setTo(0, 0);
  this.ship.angle = -90;
  // setSize does not work with rotation
  // this.ship.body.setSize(40, 15, 20, 15);
  this.bullets = game.add.group();
  this.bullets.enableBody = true;
  this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
  this.bullets.createMultiple(20, 'bullet2', 0, false);
  this.bullets.setAll('anchor.x', 0.5);
  this.bullets.setAll('anchor.y', 0.5);
  this.bullets.setAll('outOfBoundsKill', true);
  this.bullets.setAll('checkWorldBounds', true);
  game.physics.arcade.velocityFromRotation(this.ship.rotation, 0, this.ship.body.velocity);
}
Ship2.prototype = Object.create(Ship.prototype);
Ship2.prototype.constructor = Ship2;
Ship2.prototype.update = function(shipType) {
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
    this.ship.angle -= 12;
  }
  else if (this.cursor.right)
  {
    this.ship.angle += 12;
  } 
  if (this.cursor.up)
  {
    this.ship.animations.play('engines')
    this.ship.body.velocity.x = Math.cos(this.ship.rotation)*500
    this.ship.body.velocity.y = Math.sin(this.ship.rotation)*500
  }
  if(!this.cursor.up){
    this.ship.animations.play('off')
  }

  if (this.cursor.down)
  {
    if(this.game.time.now > this.nextSpecial){
      this.ship.x += Math.floor(Math.random()*800) - 400
      this.ship.y += Math.floor(Math.random()*800) - 400
      this.nextSpecial = this.game.time.now + this.specialDelay
      game.add.audio('special2').play()

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
  }
  // Prevent this ship from hitting world boundaries
  game.world.wrap(this.ship)
};
Ship2.prototype.fire = function(target) {
    if (!this.alive) return;
    // This function takes bullets from the extinct bullet pool and 
    if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
    {
      game.add.audio('fire2').play()
      this.nextFire = this.game.time.now + this.fireRate;
      var bullet = this.bullets.getFirstDead();
      bullet.bringToTop()
      
      // Using sin and cos to add offset in direction ship is facing
      bullet.reset(this.ship.x + Math.cos(this.ship.rotation)*30, this.ship.y + Math.sin(this.ship.rotation)*30);

      bullet.rotation = this.ship.rotation;
      game.physics.arcade.velocityFromRotation(this.ship.rotation, 1000, bullet.body.velocity);
      setTimeout(function(){bullet.kill()},200)
    }
}