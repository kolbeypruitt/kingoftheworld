//=============================================================================
//	I did not set up this system so I take no credit or blame for the
//	connection handling or variable creation/naming respectively
//=============================================================================
var land;
var avatar;
var player;
var avatarsList = {};
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
		if (avatarsList[id]) {
			avatarsList[id].kill();
			delete avatarsList[id];
			if (id === avatar.id) {
				var style = {
					font: "48px Arial",
					fill: "#f00"
				};
				var l = game.add.text(viewportWidth / 2 - 120, viewportHeight / 2 - 100, "You lose.", style);
				l.fixedToCamera = true;
			}

			// setTimeout lets the other kill get registered if the last two avatars collide
			setTimeout(function() {
					if (Object.keys(avatarsList).length === 1) {
						if (avatarsList[avatar.id].alive) {
							var style = {
								font: "48px Arial",
								fill: "#0f0"
							};
							w = game.add.text(viewportWidth / 2 - 300, viewportHeight / 2 - 100, "You are the KING OF THE WORLD", style);
							w.fixedToCamera = true;
				      setTimeout(function() {
				      	w.destroy();
				      }, 3000)
							switch (avatar.key) {
								case "avatar":
									setTimeout(function() {
										game.add.audio('win1').play()
									}, 1500)
									break;
								case "avatar2":
									setTimeout(function() {
										game.add.audio('win2').play()
									}, 1500)
									break;
								case "avatar3":
									setTimeout(function() {
										game.add.audio('win3').play('', 0, 1.8)
									}, 1500)
									break;
							}
						}
					} else {
						if (avatarsList[avatar.id].alive) {
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
				// if(id === avatar.id){
				// 	restartButton = game.add.button(200, 200, 'restart', restart, this);
				// 	restartButton.fixedToCamera = true
				// }
		}
	}

	eurecaClient.exports.spawnEnemy = function(i, x, y, avatarType) {
		if (i == myId) return; //this is me
		console.log('SPAWN');

		if (avatarsList[i]) {
			console.log("Trying to create a avatar that already exists.")
		} else {
			var shp;
			// avatarType is a string passed to this function to identify
			// what type of avatar needs to be created
			switch (avatarType) {
				case "avatar1":
					shp = new Avatar1(i, game, avatar, x, y);
					break;
				case "avatar2":
					shp = new Avatar2(i, game, avatar, x, y);
					break;
				case "avatar3":
					shp = new Avatar3(i, game, avatar, x, y);
					break;
			}
			avatarsList[i] = shp;
			newLogin = true
		}
	}

	eurecaClient.exports.updateState = function(id, state) {
		if (avatarsList[id]) {
			avatarsList[id].avatar.bringToTop();
			avatarsList[id].cursor = state;
			avatarsList[id].avatar.x = state.x;
			avatarsList[id].avatar.y = state.y;
			avatarsList[id].avatar.angle = state.angle;
			avatarsList[id].alive = state.alive;
			avatarsList[id].avatarType = state.avatarType;
			avatarsList[id].update(state.avatarType);
		} else {
			// This code not needed
			// var shp;
			// switch(state.avatarType){
			// 	case "avatar1":
			// 		shp = new Avatar1(id, game, avatar, state.x, state.y);
			// 		break;
			// 	case "avatar2":
			// 		shp = new Avatar2(id, game, avatar, state.x, state.y);
			// 		break;
			// }
			// avatarsList[id] = shp;
			// newLogin = true
		}
	}
}


Avatar = function(index, game, player, x, y) {

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
	this.avatarType = ''


	this.currentSpeed = 0;
	this.fireRate;
	this.nextFire = 0;
	// Set default delay on special ability to 100ms
	this.specialDelay = 100;
	this.nextSpecial = 0;
	this.alive = true;


};

Avatar.prototype.kill = function() {
	this.alive = false;
	this.avatar.kill();
}







function Avatar1(myId, game, avatar, x, y) {
  Avatar.call(this, myId, game, avatar)
  this.health = 30;
  this.fireRate = 500;
  this.damage = 5;
  this.avatarType = 'avatar1'
    // this.avatar = game.add.sprite(x, y, 'avatar');
  this.avatar = game.add.sprite(x, y, 'marvin', 78);
  this.avatar.animations.add('engines', [1, 2], 20, true);
  this.avatar.animations.add('off', [0], 20, true);


  this.avatar.animations.add('walk_up', [60, 61, 62, 63, 64, 65, 66, 67, 68], 60, false, true);
  this.avatar.animations.add('walk_left', [69, 70, 71, 72, 73, 74, 75, 76, 77], 60, false, true);
  this.avatar.animations.add('walk_down', [78, 79, 80, 81, 82, 83, 84, 85, 86], 60, false, true);
  this.avatar.animations.add('walk_right', [87, 88, 89, 90, 91, 92, 93, 94, 95], 60, false, true);

  this.avatar.animations.add('attack_up', [178, 179, 180, 181, 182, 183], 60, false, true);
  this.avatar.animations.add('attack_left', [184, 185, 186, 187, 188, 189], 60, false, true);
  this.avatar.animations.add('attack_down', [190, 191, 192, 193, 194, 195], 60, false, true);
  this.avatar.animations.add('attack_right', [196, 197, 198, 199, 200, 201], 60, false, true);

  this.avatar.animations.add('die', [172, 173, 174, 175, 176, 177], 60, false, true);

  this.avatar.anchor.set(0.5);
  this.avatar.id = myId;
  game.physics.enable(this.avatar, Phaser.Physics.ARCADE);
  this.avatar.body.immovable = false;
  this.avatar.body.drag.setTo(40);
  this.avatar.body.maxVelocity.setTo(330);
  this.avatar.body.bounce.setTo(0, 0);
  // setSize does not work with rotation
  // this.avatar.body.setSize(40, 15, 20, 15);
  this.avatar.body.collideWorldBounds = true;
  this.avatar.body.checkCollision.up = false;
  this.avatar.body.checkCollision.down = false;
  this.avatar.body.bounce.setTo(1, 1);


  // this.bullets = game.add.group();
  // this.bullets.enableBody = true;
  // this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
  // this.bullets.createMultiple(20, 'bullet1', 0, false);
  // this.bullets.setAll('anchor.x', 0.5);
  // this.bullets.setAll('anchor.y', 0.5);
  // this.bullets.setAll('outOfBoundsKill', true);
  // this.bullets.setAll('checkWorldBounds', true);
  // Allow powerslide
  game.physics.arcade.velocityFromRotation(this.avatar.rotation, 0, this.avatar.body.velocity);
}
Avatar1.prototype = Object.create(Avatar.prototype);
Avatar1.prototype.constructor = Avatar1;
Avatar1.prototype.update = function(avatarType) {

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
    if (this.avatar.id == myId) {
      // send latest valid state to the server
      this.input.x = this.avatar.x;
      this.input.y = this.avatar.y;
      this.input.angle = this.avatar.angle;
      this.input.alive = this.avatar.alive;
      this.input.avatarType = this.avatarType;

      eurecaServer.handleKeys(this.input);
      newLogin = false
    }
  }

  this.avatar.body.velocity.x = 0;
  this.avatar.body.velocity.y = 0;

  if (this.cursor.left) {
    this.avatar.body.velocity.x = -200;
    this.currentDir = "left"
    this.avatar.animations.play('walk_left', 8, false, false)
  }

  if (this.cursor.right) {
    this.avatar.body.velocity.x = 200;
    this.currentDir = "right"
    this.avatar.animations.play('walk_right', 8, false, false);
  }
  if (this.cursor.up) {
    this.avatar.body.velocity.y = -200;
    this.currentDir = "up"
    this.avatar.animations.play('walk_up', 8, false, false);
  }
  if (this.cursor.down) {
    this.avatar.body.velocity.y = 200;
    this.currentDir = "down"
    this.avatar.animations.play('walk_down', 8, false, false);
  }
  
  var isRunning = (this.cursor.left || this.cursor.right || this.cursor.up || this.cursor.down || this.cursor.atack);
  var isAttacking = true;

  if (!isRunning) {
    if (this.cursor.attack) {

    } else if (!isAttacking){
      this.avatar.animations.stop();
    }
  }

  if (this.cursor.attack && this.currentDir === "left") {
    isAttacking = true;
    // if (isInRange)
    this.avatar.animations.play('attack_left', 8, false, false).onComplete.add(function () {
      isAttacking = false;
    }, this);
    // this.attack(this.avatar, enemy)
  } else
  if (this.cursor.attack && this.currentDir === "right") {
    this.avatar.animations.play('attack_right', 8, false, false).onComplete.add(function () {
      isAttacking = false;
    }, this);
  } else
  if (this.cursor.attack && this.currentDir === "up") {
    this.avatar.animations.play('attack_up', 8, false, false).onComplete.add(function () {
      isAttacking = false;
    }, this);
  } else
  if (this.cursor.attack && this.currentDir === "down") {
    this.avatar.animations.play('attack_down', 8, false, false).onComplete.add(function () {
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

  if (this.cursor.up) slideDirection = this.avatar.rotation

  if (this.currentSpeed > 0) {
    game.physics.arcade.velocityFromRotation(slideDirection, this.currentSpeed, this.avatar.body.velocity);
  }

  game.world.wrap(this.avatar)
};

function Avatar2(myId, game, avatar, x, y) {
  Avatar.call(this, myId, game, avatar)
  this.health = 30;
  this.fireRate = 500;
  this.damage = 5;
  this.avatarType = 'avatar2'
    // this.avatar = game.add.sprite(x, y, 'avatar');
  this.avatar = game.add.sprite(x, y, 'mariah', 78);
  this.avatar.animations.add('engines', [1, 2], 20, true);
  this.avatar.animations.add('off', [0], 20, true);


  this.avatar.animations.add('walk_up', [59, 60, 61, 62, 63, 64, 65, 66, 67], 60, false, true);
  this.avatar.animations.add('walk_left', [69, 70, 71, 72, 73, 74, 75, 76], 60, false, true);
  this.avatar.animations.add('walk_down', [77, 78, 79, 80, 81, 82, 83, 84, 85], 60, false, true);
  this.avatar.animations.add('walk_right', [87, 88, 89, 90, 91, 92, 93, 94], 60, false, true);

  this.avatar.animations.add('attack_up', [178, 179, 180, 181, 182, 183], 60, false, true);
  this.avatar.animations.add('attack_left', [184, 185, 186, 187, 188, 189], 60, false, true);
  this.avatar.animations.add('attack_down', [190, 191, 192, 193, 194, 195], 60, false, true);
  this.avatar.animations.add('attack_right', [196, 197, 198, 199, 200, 201], 60, false, true);

  this.avatar.animations.add('die', [172, 173, 174, 175, 176, 177], 60, false, true);

  this.avatar.anchor.set(0.5);
  this.avatar.id = myId;
  game.physics.enable(this.avatar, Phaser.Physics.ARCADE);
  this.avatar.body.immovable = false;
  this.avatar.body.drag.setTo(40);
  this.avatar.body.maxVelocity.setTo(330);
  this.avatar.body.bounce.setTo(0, 0);
  // setSize does not work with rotation
  // this.avatar.body.setSize(40, 15, 20, 15);
  this.avatar.body.collideWorldBounds = true;
  this.avatar.body.checkCollision.up = false;
  this.avatar.body.checkCollision.down = false;
  this.avatar.body.bounce.setTo(1, 1);


  // this.bullets = game.add.group();
  // this.bullets.enableBody = true;
  // this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
  // this.bullets.createMultiple(20, 'bullet1', 0, false);
  // this.bullets.setAll('anchor.x', 0.5);
  // this.bullets.setAll('anchor.y', 0.5);
  // this.bullets.setAll('outOfBoundsKill', true);
  // this.bullets.setAll('checkWorldBounds', true);
  // Allow powerslide
  game.physics.arcade.velocityFromRotation(this.avatar.rotation, 0, this.avatar.body.velocity);
}
Avatar2.prototype = Object.create(Avatar.prototype);
Avatar2.prototype.constructor = Avatar2;
Avatar2.prototype.update = function(avatarType) {

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
    if (this.avatar.id == myId) {
      // send latest valid state to the server
      this.input.x = this.avatar.x;
      this.input.y = this.avatar.y;
      this.input.angle = this.avatar.angle;
      this.input.alive = this.avatar.alive;
      this.input.avatarType = this.avatarType;

      eurecaServer.handleKeys(this.input);
      newLogin = false
    }
  }

  this.avatar.body.velocity.x = 0;
  this.avatar.body.velocity.y = 0;

  if (this.cursor.left) {
    this.avatar.body.velocity.x = -200;
    this.currentDir = "left"
    this.avatar.animations.play('walk_left', 8, false, false)
  }

  if (this.cursor.right) {
    this.avatar.body.velocity.x = 200;
    this.currentDir = "right"
    this.avatar.animations.play('walk_right', 8, false, false);
  }
  if (this.cursor.up) {
    this.avatar.body.velocity.y = -200;
    this.currentDir = "up"
    this.avatar.animations.play('walk_up', 8, false, false);
  }
  if (this.cursor.down) {
    this.avatar.body.velocity.y = 200;
    this.currentDir = "down"
    this.avatar.animations.play('walk_down', 8, false, false);
  }
  
  var isRunning = (this.cursor.left || this.cursor.right || this.cursor.up || this.cursor.down || this.cursor.atack);
  var isAttacking = true;

  if (!isRunning) {
    if (this.cursor.attack) {

    } else if (!isAttacking){
      this.avatar.animations.stop();
    }
  }

  if (this.cursor.attack && this.currentDir === "left") {
    isAttacking = true;
    // if (isInRange)
    this.avatar.animations.play('attack_left', 8, false, false).onComplete.add(function () {
      isAttacking = false;
    }, this);
    // this.attack(this.avatar, enemy)
  } else
  if (this.cursor.attack && this.currentDir === "right") {
    this.avatar.animations.play('attack_right', 8, false, false).onComplete.add(function () {
      isAttacking = false;
    }, this);
  } else
  if (this.cursor.attack && this.currentDir === "up") {
    this.avatar.animations.play('attack_up', 8, false, false).onComplete.add(function () {
      isAttacking = false;
    }, this);
  } else
  if (this.cursor.attack && this.currentDir === "down") {
    this.avatar.animations.play('attack_down', 8, false, false).onComplete.add(function () {
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

  if (this.cursor.up) slideDirection = this.avatar.rotation

  if (this.currentSpeed > 0) {
    game.physics.arcade.velocityFromRotation(slideDirection, this.currentSpeed, this.avatar.body.velocity);
  }

  game.world.wrap(this.avatar)
};


function Avatar3(myId, game, avatar, x, y) {
  Avatar.call(this, myId, game, avatar)
  this.health = 30;
  this.fireRate = 500;
  this.damage = 5;
  this.avatarType = 'avatar3'
    // this.avatar = game.add.sprite(x, y, 'avatar');
  this.avatar = game.add.sprite(x, y, 'martin', 78);
  this.avatar.animations.add('engines', [1, 2], 20, true);
  this.avatar.animations.add('off', [0], 20, true);


  this.avatar.animations.add('walk_up', [60, 61, 62, 63, 64, 65, 66, 67, 68], 60, false, true);
  this.avatar.animations.add('walk_left', [69, 70, 71, 72, 73, 74, 75, 76, 77], 60, false, true);
  this.avatar.animations.add('walk_down', [78, 79, 80, 81, 82, 83, 84, 85, 86], 60, false, true);
  this.avatar.animations.add('walk_right', [ 89, 90, 91, 92, 93, 94, 95], 60, false, true);

  this.avatar.animations.add('attack_up', [178, 179, 180, 181, 182, 183], 60, false, true);
  this.avatar.animations.add('attack_left', [184, 185, 186, 187, 188, 189], 60, false, true);
  this.avatar.animations.add('attack_down', [190, 191, 192, 193, 194, 195], 60, false, true);
  this.avatar.animations.add('attack_right', [196, 197, 198, 199, 200, 201], 60, false, true);

  this.avatar.animations.add('die', [172, 173, 174, 175, 176, 177], 60, false, true);

  this.avatar.anchor.set(0.5);
  this.avatar.id = myId;
  game.physics.enable(this.avatar, Phaser.Physics.ARCADE);
  this.avatar.body.immovable = false;
  this.avatar.body.drag.setTo(40);
  this.avatar.body.maxVelocity.setTo(330);
  this.avatar.body.bounce.setTo(0, 0);
  // setSize does not work with rotation
  // this.avatar.body.setSize(40, 15, 20, 15);
  this.avatar.body.collideWorldBounds = true;
  this.avatar.body.checkCollision.up = false;
  this.avatar.body.checkCollision.down = false;
  this.avatar.body.bounce.setTo(1, 1);


  // this.bullets = game.add.group();
  // this.bullets.enableBody = true;
  // this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
  // this.bullets.createMultiple(20, 'bullet1', 0, false);
  // this.bullets.setAll('anchor.x', 0.5);
  // this.bullets.setAll('anchor.y', 0.5);
  // this.bullets.setAll('outOfBoundsKill', true);
  // this.bullets.setAll('checkWorldBounds', true);
  // Allow powerslide
  game.physics.arcade.velocityFromRotation(this.avatar.rotation, 0, this.avatar.body.velocity);
}
Avatar3.prototype = Object.create(Avatar.prototype);
Avatar3.prototype.constructor = Avatar3;
Avatar3.prototype.update = function(avatarType) {

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
    if (this.avatar.id == myId) {
      // send latest valid state to the server
      this.input.x = this.avatar.x;
      this.input.y = this.avatar.y;
      this.input.angle = this.avatar.angle;
      this.input.alive = this.avatar.alive;
      this.input.avatarType = this.avatarType;

      eurecaServer.handleKeys(this.input);
      newLogin = false
    }
  }

  this.avatar.body.velocity.x = 0;
  this.avatar.body.velocity.y = 0;

  if (this.cursor.left) {
    this.avatar.body.velocity.x = -200;
    this.currentDir = "left"
    this.avatar.animations.play('walk_left', 8, false, false)
  }

  if (this.cursor.right) {
    this.avatar.body.velocity.x = 200;
    this.currentDir = "right"
    this.avatar.animations.play('walk_right', 8, false, false);
  }
  if (this.cursor.up) {
    this.avatar.body.velocity.y = -200;
    this.currentDir = "up"
    this.avatar.animations.play('walk_up', 8, false, false);
  }
  if (this.cursor.down) {
    this.avatar.body.velocity.y = 200;
    this.currentDir = "down"
    this.avatar.animations.play('walk_down', 8, false, false);
  }
  
  var isRunning = (this.cursor.left || this.cursor.right || this.cursor.up || this.cursor.down || this.cursor.atack);
  var isAttacking = true;

  if (!isRunning) {
    if (this.cursor.attack) {

    } else if (!isAttacking){
      this.avatar.animations.stop();
    }
  }

  if (this.cursor.attack && this.currentDir === "left") {
    isAttacking = true;
    // if (isInRange)
    this.avatar.animations.play('attack_left', 8, false, false).onComplete.add(function () {
      isAttacking = false;
    }, this);
    // this.attack(this.avatar, enemy)
  } else
  if (this.cursor.attack && this.currentDir === "right") {
    this.avatar.animations.play('attack_right', 8, false, false).onComplete.add(function () {
      isAttacking = false;
    }, this);
  } else
  if (this.cursor.attack && this.currentDir === "up") {
    this.avatar.animations.play('attack_up', 8, false, false).onComplete.add(function () {
      isAttacking = false;
    }, this);
  } else
  if (this.cursor.attack && this.currentDir === "down") {
    this.avatar.animations.play('attack_down', 8, false, false).onComplete.add(function () {
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

  if (this.cursor.up) slideDirection = this.avatar.rotation

  if (this.currentSpeed > 0) {
    game.physics.arcade.velocityFromRotation(slideDirection, this.currentSpeed, this.avatar.body.velocity);
  }

  game.world.wrap(this.avatar)
};







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
	game.load.spritesheet('marvinBtn', 'assets/marvinBtn.png');
	game.load.atlasJSONHash('mariah', 'assets/mariah.png', 'assets/mariah.json');
	game.load.spritesheet('mariahBtn', 'assets/mariahBtn.png')
	game.load.atlasJSONHash('martin', 'assets/martin.png', 'assets/martin.json');
	game.load.spritesheet('martinBtn', 'assets/martinBtn.png')
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

	var chooseAvatar1 = game.add.button(viewportWidth / 4 - 150, 400, 'marvinBtn', create.bind(this, Avatar1, 'avatar1'));
	var chooseAvatar2 = game.add.button(viewportWidth / 4 - 50, 400, 'mariahBtn', create.bind(this, Avatar2, 'avatar2'));
	var chooseAvatar3 = game.add.button(viewportWidth / 4 + 100, 400, 'martinBtn', create.bind(this, Avatar3, 'avatar3'));

	var instructions = "Arrow keys to move, spacebar to attack";
	var style2 = {
		font: "20px Arial",
		fill: "#ddd",
		align: "center"
	};
	var t2 = game.add.text(viewportWidth / 2 - 200, viewportHeight - 50, instructions, style2);

}


function create(avatarType, avatarString) {

	game.add.audio('goldenaxe').play('', 0, .7);

	//  Resize our game world
	game.world.setBounds(0, 0, 1920, 1080);
	// game.world.setBounds(-1000, -1000, 2000, 2000);
	game.stage.disableVisibilityChange = true;
	//  Our tiled scrolling background
	land = game.add.tileSprite(0, 0, viewportWidth, viewportHeight, 'grass');
	land.fixedToCamera = true;

	player = new avatarType(myId, game, avatar);
	avatarsList[myId] = player;
	avatar = player.avatar;
	avatar.x = game.world.randomX
	avatar.y = game.world.randomY
	avatar.bringToTop();
	bullets = player.bullets;

	//	Logo is in menu now
	//=============================================================================	
	// logo = game.add.sprite(viewportWidth/2 - 200, viewportHeight/3 - 85, 'logo');
	// logo.fixedToCamera = true;
	// game.input.onDown.add(removeLogo, this);


	game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
	game.camera.follow(avatar);
	game.camera.focusOnXY(0, 0);

	cursors = game.input.keyboard.createCursorKeys();
	fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

	var health = "Health: " + player.health;
	var style = {
		font: "18px Arial",
		fill: "#ddd"
	};
	avatar.h = game.add.text(10, 20, health, style);
	avatar.h.fixedToCamera = true;


	// setTimeout(removeLogo, 2000);
	var keys = {
		x: avatar.x,
		y: avatar.y,
		angle: avatar.angle,
		rot: avatar.rotation,
		alive: avatar.alive,
		avatarType: player.avatarType
	}
	eurecaServer.handleKeys(keys);
	eurecaServer.handshake(avatarString);
	ready = true;

	// Remove menu buttons
	// chooseAvatar1.kill();
	// chooseAvatar2.kill();
	// chooseAvatar3.kill();
}

//	Not using respawn in this version
//=============================================================================
// function respawn (avatarType) {
// 	land = game.add.tileSprite(0, 0, viewportWidth, viewportHeight, 'space');
// 	land.fixedToCamera = true;
// 	avatarsList = {};
// 	player = new avatarType(myId, game, avatar);
// 	avatarsList[myId] = player;
// 	avatar = player.avatar;
// 	avatar.x= game.world.randomX 
// 	avatar.y= game.world.randomY
// 	explosions = game.add.group();

// 	for (var i = 0; i < 10; i++)
// 	{
// 		var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
// 		explosionAnimation.anchor.setTo(0.5, 0.5);
// 		explosionAnimation.animations.add('kaboom');
// 	}
// 	avatar.bringToTop();
// 	game.camera.follow(avatar);
// 	game.camera.focusOnXY(0, 0);
// 	var keys = {
// 		x: avatar.x,
// 		y: avatar.y,
// 		angle: avatar.angle,
// 		rot: avatar.rotation,
// 		alive: avatar.alive,
// 		avatarType: player.avatarType
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

	for (var i in avatarsList) {
		if (!avatarsList[i]) continue;
		var curBullets = avatarsList[i].bullets;
		var curAvatar = avatarsList[i].avatar;
		if (avatarsList[i].alive) avatarsList[i].update();
		for (var j in avatarsList) {
			if (!avatarsList[j]) continue;
			if (j != i) {

				var targetAvatar = avatarsList[j].avatar;
				// Destroying avatars on collision so collision detection not needed in this version
				// game.physics.arcade.collide(curAvatar, targetAvatar);
				if(game.physics.arcade.distanceBetween(curAvatar, targetAvatar) < 100) {
					if (avatarsList[i].input.attack) {
						if (!avatarsList[i].alive) return;

						if (this.game.time.now > avatarsList[i].nextFire) {
						  // game.add.audio('fire1').play()
						  avatarsList[i].nextFire = this.game.time.now + avatarsList[i].fireRate;
						  // Destroy the bullet after a certain time to limit range 
						  avatarsList[j].health -= avatarsList[i].damage;
						  console.log('enemy health ', avatarsList[j].health);
						  // avatarsList[j].update();
						  attackKilledPlayer(avatarsList[i], avatarsList[j]);
						  // setTimeout(function() {
						  game.add.audio('slash').play('', 0, 0.7);
						  // }, 400)
						}

					}

				}

			}
			if (!avatarsList[j].alive) {
				avatarsList[j].update();
			}
		}
	}
}

function attackKilledPlayer(curAvatar, targetAvatar) {
	if (targetAvatar.health <= 0) {
		// var explosionAnimation = explosions.getFirstExists(false);
		// explosionAnimation.reset(targetAvatar.avatar.x, targetAvatar.avatar.y);
		// explosionAnimation.play('kaboom', 30, false, true);

		curAvatar.avatar.scale.setTo(1.5, 1.5);
		curAvatar.health += 10;
		curAvatar.damage += 5;
		targetAvatar.avatar.animations.play('die', 8, false, false).onComplete.add(function () {
      setTimeout(function() {
      	eurecaServer.deletePlayer(targetAvatar.avatar.id)
      }, 40)
      game.add.audio('die').play('', 0, 4);
    }, this);
	}
}

// function bulletHitPlayer(avatar, bullet) {
// 	bullet.kill();

// 	switch (bullet.key) {
// 		case "bullet1":
// 			avatarsList[avatar.id].health -= 10
// 			game.add.audio('hit1').play('', 0, .3)
// 			if (avatar.h) {
// 				avatar.h.destroy()
// 				var health = "Health: " + player.health;
// 				var style = {
// 					font: "16px Arial",
// 					fill: "#ddd"
// 				};
// 				avatar.h = game.add.text(10, 20, health, style);
// 				avatar.h.fixedToCamera = true;
// 			}
// 			break;
// 		case "bullet2":
// 			avatarsList[avatar.id].health -= 2
// 			game.add.audio('hit2').play('', 0, .5)
// 			if (avatar.h) {
// 				avatar.h.destroy()
// 				var health = "Health: " + player.health;
// 				var style = {
// 					font: "16px Arial",
// 					fill: "#ddd"
// 				};
// 				avatar.h = game.add.text(10, 20, health, style);
// 				avatar.h.fixedToCamera = true;
// 			}
// 			break;
// 		case "bullet3":
// 			avatarsList[avatar.id].health -= 20
// 			game.add.audio('hit3').play()
// 			if (avatar.h) {
// 				avatar.h.destroy()
// 				var health = "Health: " + player.health;
// 				var style = {
// 					font: "16px Arial",
// 					fill: "#ddd"
// 				};
// 				avatar.h = game.add.text(10, 20, health, style);
// 				avatar.h.fixedToCamera = true;
// 			}
// 			break;
// 	}

	// if (avatarsList[avatar.id].health <= 0) {
	// 	var explosionAnimation = explosions.getFirstExists(false);
	// 	explosionAnimation.reset(avatar.x, avatar.y);
	// 	explosionAnimation.play('kaboom', 30, false, true);
	// 	setTimeout(function() {
	// 		eurecaServer.deletePlayer(avatar.id)
	// 	}, 40)
	// 	game.add.audio('avatardies').play('', 0, .7)
	// }

// }

// function avatarsCollide(avatar, curAvatar) {
// 	setTimeout(function() {
// 		eurecaServer.deletePlayer(avatar.id)
// 		var explosionAnimation = explosions.getFirstExists(false);
// 		explosionAnimation.reset(avatar.x, avatar.y);
// 		explosionAnimation.play('kaboom', 30, false, true);
// 	}, 40)
// 	game.add.audio('avatardies').play('', 0, .7)
// }

function restart() {
	restartButton.kill()
	ready = false;
	respawn();
	eurecaServer.handshake();
	ready = true;
}

function render() {}