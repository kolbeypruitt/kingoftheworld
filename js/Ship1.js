function Ship1(myId, game, ship, x, y) {
  Ship.call(this, myId, game, ship)
  this.health = 30;
  this.fireRate = 500;
  this.damage = 5;
  this.shipType = 'ship1'
    // this.ship = game.add.sprite(x, y, 'ship');
  this.ship = game.add.sprite(x, y, 'marvin', 78);
  this.ship.animations.add('engines', [1, 2], 20, true);
  this.ship.animations.add('off', [0], 20, true);


  this.ship.animations.add('walk_up', [60, 61, 62, 63, 64, 65, 66, 67, 68], 60, false, true);
  this.ship.animations.add('walk_left', [69, 70, 71, 72, 73, 74, 75, 76, 77], 60, false, true);
  this.ship.animations.add('walk_down', [78, 79, 80, 81, 82, 83, 84, 85, 86], 60, false, true);
  this.ship.animations.add('walk_right', [87, 88, 89, 90, 91, 92, 93, 94, 95], 60, false, true);

  this.ship.animations.add('attack_up', [178, 179, 180, 181, 182, 183], 60, false, true);
  this.ship.animations.add('attack_left', [184, 185, 186, 187, 188, 189], 60, false, true);
  this.ship.animations.add('attack_down', [190, 191, 192, 193, 194, 195], 60, false, true);
  this.ship.animations.add('attack_right', [196, 197, 198, 199, 200, 201], 60, false, true);

  this.ship.animations.add('die', [172, 173, 174, 175, 176, 177], 60, false, true);

  this.ship.anchor.set(0.5);
  this.ship.id = myId;
  game.physics.enable(this.ship, Phaser.Physics.ARCADE);
  this.ship.body.immovable = false;
  this.ship.body.drag.setTo(40);
  this.ship.body.maxVelocity.setTo(330);
  this.ship.body.bounce.setTo(0, 0);
  // setSize does not work with rotation
  // this.ship.body.setSize(40, 15, 20, 15);
  this.ship.body.collideWorldBounds = true;
  this.ship.body.checkCollision.up = false;
  this.ship.body.checkCollision.down = false;
  this.ship.body.bounce.setTo(1, 1);


  this.bullets = game.add.group();
  this.bullets.enableBody = true;
  this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
  this.bullets.createMultiple(20, 'bullet1', 0, false);
  this.bullets.setAll('anchor.x', 0.5);
  this.bullets.setAll('anchor.y', 0.5);
  this.bullets.setAll('outOfBoundsKill', true);
  this.bullets.setAll('checkWorldBounds', true);
  // Allow powerslide
  game.physics.arcade.velocityFromRotation(this.ship.rotation, 0, this.ship.body.velocity);
}
Ship1.prototype = Object.create(Ship.prototype);
Ship1.prototype.constructor = Ship1;
Ship1.prototype.update = function(shipType) {

  var inputChanged = (
    this.cursor.left != this.input.left ||
    this.cursor.right != this.input.right ||
    this.cursor.up != this.input.up ||
    this.cursor.down != this.input.down ||
    this.cursor.fire != this.input.fire ||
    this.cursor.attack != this.input.attack
  );

  if (inputChanged || newLogin === true) {
    //Handle input change here
    //send new values to the server   
    if (this.ship.id == myId) {
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

  this.ship.body.velocity.x = 0;
  this.ship.body.velocity.y = 0;

  if (this.cursor.left) {
    this.ship.body.velocity.x = -200;
    this.currentDir = "left"
    this.ship.animations.play('walk_left', 8, false, false)
  }

  if (this.cursor.right) {
    this.ship.body.velocity.x = 200;
    this.currentDir = "right"
    this.ship.animations.play('walk_right', 8, false, false);
  }
  if (this.cursor.up) {
    this.ship.body.velocity.y = -200;
    this.currentDir = "up"
    this.ship.animations.play('walk_up', 8, false, false);
  }
  if (this.cursor.down) {
    this.ship.body.velocity.y = 200;
    this.currentDir = "down"
    this.ship.animations.play('walk_down', 8, false, false);
  }
  
  var isRunning = (this.cursor.left || this.cursor.right || this.cursor.up || this.cursor.down || this.cursor.atack);
  var isAttacking = true;

  if (!isRunning) {
    if (this.cursor.attack) {

    } else if (!isAttacking){
      this.ship.animations.stop();
    }
  }

  if (this.cursor.attack && this.currentDir === "left") {
    isAttacking = true;
    // if (isInRange)
    this.ship.animations.play('attack_left', 8, false, false).onComplete.add(function () {
      isAttacking = false;
    }, this);
    // this.attack(this.ship, enemy)
  } else
  if (this.cursor.attack && this.currentDir === "right") {
    this.ship.animations.play('attack_right', 8, false, false).onComplete.add(function () {
      isAttacking = false;
    }, this);
  } else
  if (this.cursor.attack && this.currentDir === "up") {
    this.ship.animations.play('attack_up', 8, false, false).onComplete.add(function () {
      isAttacking = false;
    }, this);
  } else
  if (this.cursor.attack && this.currentDir === "down") {
    this.ship.animations.play('attack_down', 8, false, false).onComplete.add(function () {
      isAttacking = false;
    }, this);
  }

  if (this.cursor.fire) {
    this.fire({
      x: this.cursor.tx,
      y: this.cursor.ty
    });
  }
  // The *.8 creates a parallax scrolling effect
  land.tilePosition.x = -game.camera.x * .8;
  land.tilePosition.y = -game.camera.y * .8;

  if (this.cursor.up) slideDirection = this.ship.rotation

  if (this.currentSpeed > 0) {
    game.physics.arcade.velocityFromRotation(slideDirection, this.currentSpeed, this.ship.body.velocity);
  }

  game.world.wrap(this.ship)
};
Ship1.prototype.fire = function(target) {
  if (!this.alive) return;
  // This function takes bullets from the extinct bullet pool and allows fire if delay is up
  if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
    // game.add.audio('fire1').play()
    this.nextFire = this.game.time.now + this.fireRate;
    var bullet = this.bullets.getFirstDead();
    bullet.bringToTop()

    // Using sin and cos to add offset in direction ship is facing
    bullet.reset(this.ship.x + Math.cos(this.ship.rotation) * 30, this.ship.y + Math.sin(this.ship.rotation) * 30);

    // Rotate the sprite
    bullet.rotation = this.ship.rotation;
    // Set the bullet speed and direction
    game.physics.arcade.velocityFromRotation(this.ship.rotation, 800, bullet.body.velocity);
    // Destroy the bullet after a certain time to limit range 
    setTimeout(function() {
      bullet.kill()
    }, 600)
  }
}