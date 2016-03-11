//=============================================================================
//	I did not set up this system so I take no credit or blame for the
//	connection handling or variable creation/naming respectively
//=============================================================================
var land;
var ship;
var player;
var shipsList = {};
var explosions;
var logo;
var cursors;
var fireButton;
var bullets;
var restartButton;
var myId = 0;
var viewportWidth = window.innerWidth * window.devicePixelRatio;
var viewportHeight = window.innerHeight * window.devicePixelRatio;
var fireRate = 400;
var nextFire = 0;
var newLogin = false;
var ready = false;
var eurecaServer;

//	This function will handle client communication with the server
var eurecaClientSetup = function() {
	//create an instance of eureca.io client
	var eurecaClient = new Eureca.Client();

	eurecaClient.ready(function(proxy) {
		eurecaServer = proxy;
	});
	//=============================================================================
	//	Methods defined under "exports" namespace become available server side
	//=============================================================================
	eurecaClient.exports.setId = function(id) {
		// This is called on connect, assigns id and takes player to menu
		myId = id;
		menu();
	}

	eurecaClient.exports.kill = function(id) {
		if (shipsList[id]) {
			shipsList[id].kill();
			delete shipsList[id];
			if (id === ship.id) {
				var style = {
					font: "48px Arial",
					fill: "#f00"
				};
				var l = game.add.text(viewportWidth / 2 - 120, viewportHeight / 2 - 100, "You lose.", style);
				l.fixedToCamera = true;
			}

			// setTimeout lets the other kill get registered if the last two ships collide
			setTimeout(function() {
					if (Object.keys(shipsList).length === 1) {
						if (shipsList[ship.id].alive) {
							var style = {
								font: "48px Arial",
								fill: "#0f0"
							};
							w = game.add.text(viewportWidth / 2 - 120, viewportHeight / 2 - 100, "You are the KING OF THE WORLD", style);
							w.fixedToCamera = true;
				      setTimeout(function() {
				      	w.destroy();
				      }, 3000)
							switch (ship.key) {
								case "ship":
									setTimeout(function() {
										game.add.audio('win1').play()
									}, 1500)
									break;
								case "ship2":
									setTimeout(function() {
										game.add.audio('win2').play()
									}, 1500)
									break;
								case "ship3":
									setTimeout(function() {
										game.add.audio('win3').play('', 0, 1.8)
									}, 1500)
									break;
							}
						}
					} else {
						if (shipsList[ship.id].alive) {
							var style = {
								font: "48px Arial",
								fill: "#0f0"
							};
							w = game.add.text(viewportWidth / 2 - 120, viewportHeight / 2 - 100, "You leveled up!", style);
							w.fixedToCamera = true;
				      setTimeout(function() {
				      	w.destroy();
				      }, 3000)
				    }
					}
				}, 1)
				// Adds restart button on death, not used in this version
				// if(id === ship.id){
				// 	restartButton = game.add.button(200, 200, 'restart', restart, this);
				// 	restartButton.fixedToCamera = true
				// }
		}
	}

	eurecaClient.exports.spawnEnemy = function(i, x, y, shipType) {
		if (i == myId) return; //this is me
		console.log('SPAWN');

		if (shipsList[i]) {
			console.log("Trying to create a ship that already exists.")
		} else {
			var shp;
			// shipType is a string passed to this function to identify
			// what type of ship needs to be created
			switch (shipType) {
				case "ship1":
					shp = new Ship1(i, game, ship, x, y);
					break;
				case "ship2":
					shp = new Ship2(i, game, ship, x, y);
					break;
				case "ship3":
					shp = new Ship3(i, game, ship, x, y);
					break;
			}
			shipsList[i] = shp;
			newLogin = true
		}
	}

	eurecaClient.exports.updateState = function(id, state) {
		if (shipsList[id]) {
			shipsList[id].ship.bringToTop();
			shipsList[id].cursor = state;
			shipsList[id].ship.x = state.x;
			shipsList[id].ship.y = state.y;
			shipsList[id].ship.angle = state.angle;
			shipsList[id].alive = state.alive;
			shipsList[id].shipType = state.shipType;
			shipsList[id].update(state.shipType);
		} else {
			// This code not needed
			// var shp;
			// switch(state.shipType){
			// 	case "ship1":
			// 		shp = new Ship1(id, game, ship, state.x, state.y);
			// 		break;
			// 	case "ship2":
			// 		shp = new Ship2(id, game, ship, state.x, state.y);
			// 		break;
			// }
			// shipsList[id] = shp;
			// newLogin = true
		}
	}
}


Ship = function(index, game, player, x, y) {

	this.cursor = {
		left: false,
		right: false,
		up: false,
		down: false,
		fire: false
	}

	this.input = {
		left: false,
		right: false,
		up: false,
		down: false,
		fire: false
	}

	this.game = game;
	this.health;
	this.player = player;
	this.shipType = ''


	this.currentSpeed = 0;
	this.fireRate;
	this.nextFire = 0;
	// Set default delay on special ability to 100ms
	this.specialDelay = 100;
	this.nextSpecial = 0;
	this.alive = true;


};

Ship.prototype.kill = function() {
	this.alive = false;
	this.ship.kill();
}







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


  // this.bullets = game.add.group();
  // this.bullets.enableBody = true;
  // this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
  // this.bullets.createMultiple(20, 'bullet1', 0, false);
  // this.bullets.setAll('anchor.x', 0.5);
  // this.bullets.setAll('anchor.y', 0.5);
  // this.bullets.setAll('outOfBoundsKill', true);
  // this.bullets.setAll('checkWorldBounds', true);
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

function Ship2(myId, game, ship, x, y) {
  Ship.call(this, myId, game, ship)
  this.health = 30;
  this.fireRate = 500;
  this.damage = 5;
  this.shipType = 'ship2'
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


  // this.bullets = game.add.group();
  // this.bullets.enableBody = true;
  // this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
  // this.bullets.createMultiple(20, 'bullet1', 0, false);
  // this.bullets.setAll('anchor.x', 0.5);
  // this.bullets.setAll('anchor.y', 0.5);
  // this.bullets.setAll('outOfBoundsKill', true);
  // this.bullets.setAll('checkWorldBounds', true);
  // Allow powerslide
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
Ship2.prototype.fire = function(target) {
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

function Ship3(myId, game, ship, x, y) {
  Ship.call(this, myId, game, ship)
  this.health = 30;
  this.fireRate = 500;
  this.damage = 5;
  this.shipType = 'ship3'
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


  // this.bullets = game.add.group();
  // this.bullets.enableBody = true;
  // this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
  // this.bullets.createMultiple(20, 'bullet1', 0, false);
  // this.bullets.setAll('anchor.x', 0.5);
  // this.bullets.setAll('anchor.y', 0.5);
  // this.bullets.setAll('outOfBoundsKill', true);
  // this.bullets.setAll('checkWorldBounds', true);
  // Allow powerslide
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
Ship3.prototype.fire = function(target) {
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






var game = new Phaser.Game(viewportWidth, viewportHeight, Phaser.AUTO, 'phaser-example', {
	preload: preload,
	create: eurecaClientSetup,
	update: update,
	render: render
});

function preload() {


	game.load.audio('goldenaxe', ['assets/audio/goldenaxe.mp3']);
	game.load.audio('die', ['assets/audio/die.wav']);
	game.load.audio('slash', ['assets/audio/slash.wav']);
	game.load.audio('levelup', ['assets/audio/levelup.wav']);

	game.load.audio('special2', ['assets/audio/special2.wav']);
	game.load.audio('win1', ['assets/audio/win1.wav']);
	game.load.audio('win2', ['assets/audio/win2.wav']);
	game.load.audio('win3', ['assets/audio/win3.wav']);

	game.load.atlasJSONHash('marvin', 'assets/marvin.png', 'assets/marvin.json');
	game.load.spritesheet('marvinBtn', 'assets/marvinBtn.png')
	game.load.image('logo', 'assets/logo.png');
	game.load.image('grass', 'assets/grass.png');
}

function menu() {
	var background = game.add.tileSprite(0, 0, viewportWidth, viewportHeight, 'grass');
	background.autoScroll(-10, 5)
	var logo = game.add.sprite(viewportWidth / 2 - 200, 10, 'logo');
	var choose = "Choose your character:";
	var style = {
		font: "32px Serif",
		fill: "#ddd"
	};
	var t1 = game.add.text(viewportWidth / 4 - 150, 300, choose, style);

	var chooseShip1 = game.add.button(viewportWidth / 4 - 150, 400, 'marvinBtn', create.bind(this, Ship1, 'ship1'));
	// var chooseShip2 = game.add.button(viewportWidth / 4 - 50, 390, 'ship2', create.bind(this, Ship2, 'ship2'));
	// var chooseShip3 = game.add.button(viewportWidth / 4 + 50, 370, 'ship3', create.bind(this, Ship3, 'ship3'));

	var instructions = "Arrow keys to move, spacebar to attack";
	var style2 = {
		font: "20px Arial",
		fill: "#ddd",
		align: "center"
	};
	var t2 = game.add.text(viewportWidth / 2 - 270, viewportHeight - 50, instructions, style2);

}


function create(shipType, shipString) {

	game.add.audio('goldenaxe').play('', 0, .7);

	//  Resize our game world
	game.world.setBounds(0, 0, 1920, 1080);
	// game.world.setBounds(-1000, -1000, 2000, 2000);
	game.stage.disableVisibilityChange = true;
	//  Our tiled scrolling background
	land = game.add.tileSprite(0, 0, viewportWidth, viewportHeight, 'grass');
	land.fixedToCamera = true;

	player = new shipType(myId, game, ship);
	shipsList[myId] = player;
	ship = player.ship;
	ship.x = game.world.randomX
	ship.y = game.world.randomY
	ship.bringToTop();
	bullets = player.bullets;

	//	Logo is in menu now
	//=============================================================================	
	// logo = game.add.sprite(viewportWidth/2 - 200, viewportHeight/3 - 85, 'logo');
	// logo.fixedToCamera = true;
	// game.input.onDown.add(removeLogo, this);


	game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
	game.camera.follow(ship);
	game.camera.focusOnXY(0, 0);

	cursors = game.input.keyboard.createCursorKeys();
	fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

	var health = "Health: " + player.health;
	var style = {
		font: "18px Arial",
		fill: "#ddd"
	};
	ship.h = game.add.text(10, 20, health, style);
	ship.h.fixedToCamera = true;


	// setTimeout(removeLogo, 2000);
	var keys = {
		x: ship.x,
		y: ship.y,
		angle: ship.angle,
		rot: ship.rotation,
		alive: ship.alive,
		shipType: player.shipType
	}
	eurecaServer.handleKeys(keys);
	eurecaServer.handshake(shipString);
	ready = true;

	// Remove menu buttons
	// chooseShip1.kill();
	// chooseShip2.kill();
	// chooseShip3.kill();
}

//	Not using respawn in this version
//=============================================================================
// function respawn (shipType) {
// 	land = game.add.tileSprite(0, 0, viewportWidth, viewportHeight, 'space');
// 	land.fixedToCamera = true;
// 	shipsList = {};
// 	player = new shipType(myId, game, ship);
// 	shipsList[myId] = player;
// 	ship = player.ship;
// 	ship.x= game.world.randomX 
// 	ship.y= game.world.randomY
// 	explosions = game.add.group();

// 	for (var i = 0; i < 10; i++)
// 	{
// 		var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
// 		explosionAnimation.anchor.setTo(0.5, 0.5);
// 		explosionAnimation.animations.add('kaboom');
// 	}
// 	ship.bringToTop();
// 	game.camera.follow(ship);
// 	game.camera.focusOnXY(0, 0);
// 	var keys = {
// 		x: ship.x,
// 		y: ship.y,
// 		angle: ship.angle,
// 		rot: ship.rotation,
// 		alive: ship.alive,
// 		shipType: player.shipType
// 	}
// 	eurecaServer.handleKeys(keys);
// }

// function removeLogo () {
// 	game.input.onDown.remove(removeLogo, this);
// 	logo.kill();
// }

function update() {
	//do not update if client not ready
	if (!ready) return;

	player.input.left = cursors.left.isDown;
	player.input.right = cursors.right.isDown;
	player.input.up = cursors.up.isDown;
	player.input.down = cursors.down.isDown;
	player.input.attack = fireButton.isDown;
	player.input.tx = game.input.x + game.camera.x;
	player.input.ty = game.input.y + game.camera.y;

	for (var i in shipsList) {
		if (!shipsList[i]) continue;
		var curBullets = shipsList[i].bullets;
		var curShip = shipsList[i].ship;
		if (shipsList[i].alive) shipsList[i].update();
		for (var j in shipsList) {
			if (!shipsList[j]) continue;
			if (j != i) {

				var targetShip = shipsList[j].ship;
				// Destroying ships on collision so collision detection not needed in this version
				// game.physics.arcade.collide(curShip, targetShip);
				if(game.physics.arcade.distanceBetween(curShip, targetShip) < 100) {
					if (shipsList[i].input.attack) {
						if (!shipsList[i].alive) return;

						if (this.game.time.now > shipsList[i].nextFire) {
						  // game.add.audio('fire1').play()
						  shipsList[i].nextFire = this.game.time.now + shipsList[i].fireRate;
						  // Destroy the bullet after a certain time to limit range 
						  shipsList[j].health -= shipsList[i].damage;
						  console.log('enemy health ', shipsList[j].health);
						  // shipsList[j].update();
						  attackKilledPlayer(shipsList[i], shipsList[j]);
						  setTimeout(function() {
						  	game.add.audio('slash').play('', 0, 0.7);
						  }, 400)
						}

					}

				}

			}
			if (!shipsList[j].alive) {
				shipsList[j].update();
			}
		}
	}
}

function attackKilledPlayer(curShip, targetShip) {
	if (targetShip.health <= 0) {
		// var explosionAnimation = explosions.getFirstExists(false);
		// explosionAnimation.reset(targetShip.ship.x, targetShip.ship.y);
		// explosionAnimation.play('kaboom', 30, false, true);

		curShip.ship.scale.setTo(1.5, 1.5);
		curShip.health += 10;
		curShip.damage += 5;
		targetShip.ship.animations.play('die', 8, false, false).onComplete.add(function () {
      setTimeout(function() {
      	eurecaServer.deletePlayer(targetShip.ship.id)
      }, 40)
      game.add.audio('die').play('', 0, 4);
    }, this);
	}
}

// function bulletHitPlayer(ship, bullet) {
// 	bullet.kill();

// 	switch (bullet.key) {
// 		case "bullet1":
// 			shipsList[ship.id].health -= 10
// 			game.add.audio('hit1').play('', 0, .3)
// 			if (ship.h) {
// 				ship.h.destroy()
// 				var health = "Health: " + player.health;
// 				var style = {
// 					font: "16px Arial",
// 					fill: "#ddd"
// 				};
// 				ship.h = game.add.text(10, 20, health, style);
// 				ship.h.fixedToCamera = true;
// 			}
// 			break;
// 		case "bullet2":
// 			shipsList[ship.id].health -= 2
// 			game.add.audio('hit2').play('', 0, .5)
// 			if (ship.h) {
// 				ship.h.destroy()
// 				var health = "Health: " + player.health;
// 				var style = {
// 					font: "16px Arial",
// 					fill: "#ddd"
// 				};
// 				ship.h = game.add.text(10, 20, health, style);
// 				ship.h.fixedToCamera = true;
// 			}
// 			break;
// 		case "bullet3":
// 			shipsList[ship.id].health -= 20
// 			game.add.audio('hit3').play()
// 			if (ship.h) {
// 				ship.h.destroy()
// 				var health = "Health: " + player.health;
// 				var style = {
// 					font: "16px Arial",
// 					fill: "#ddd"
// 				};
// 				ship.h = game.add.text(10, 20, health, style);
// 				ship.h.fixedToCamera = true;
// 			}
// 			break;
// 	}

	// if (shipsList[ship.id].health <= 0) {
	// 	var explosionAnimation = explosions.getFirstExists(false);
	// 	explosionAnimation.reset(ship.x, ship.y);
	// 	explosionAnimation.play('kaboom', 30, false, true);
	// 	setTimeout(function() {
	// 		eurecaServer.deletePlayer(ship.id)
	// 	}, 40)
	// 	game.add.audio('shipdies').play('', 0, .7)
	// }

// }

// function shipsCollide(ship, curShip) {
// 	setTimeout(function() {
// 		eurecaServer.deletePlayer(ship.id)
// 		var explosionAnimation = explosions.getFirstExists(false);
// 		explosionAnimation.reset(ship.x, ship.y);
// 		explosionAnimation.play('kaboom', 30, false, true);
// 	}, 40)
// 	game.add.audio('shipdies').play('', 0, .7)
// }

function restart() {
	restartButton.kill()
	ready = false;
	respawn();
	eurecaServer.handshake();
	ready = true;
}

function render() {}