

$(document).ready(function() {
	
	var canvas = $("#gameCanvas");
	var ctx = canvas.get(0).getContext("2d");
	
	//canvas dimension
	var canvasWidth = canvas.width();
	var canvasHeight = canvas.height();
	
	//game settings
	var playGame;
	var asteroids;
	var numAsteroids;
	var player;
	var score;
	var scoreTimeout;
	var arrowUp = 38;
	var arrowRight = 39;
	var arrowDown = 40;
	
	//game ui
	var ui = $("#gameUI");
	var uiIntro = $("#gameIntro");
	var uiStats = $("#gameStas");
	var uiComplete = $("#gameComplete");
	var uiPlay = $("#gamePlay");
	var uiReset = $(".gameReset");
	var uiScore = $(".gameScore");
	var soundBackground = $("#gameSoundBackground").get(0);
	var soundThrust = $("#gameSoundThrust").get(0);
	var soundDeath = $("#gameSoundDeath").get(0);
	
	//asteroid class
	var Asteroid = function(x, y, radius, vX) {
		
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.vX = vX;
		
	};
	
	// player class
	var Player = function(x, y) {
		
		this.x = x;
		this.y = y;
		this.width = 24;
		this.height = 24;
		this.halfWidth = this.width/2;
		this.halfHeight = this.height/2;
		
		this.vX = 0;
		this.vY = 0;
		
		this.moveRight = false;
		this.moveUp = false;
		this.moveDown = false;
		
		this.flameLength = 20;
		
	};
	
	//reset and start game
	function startGame() {
		
		//reset game stats
		uiScore.html("0");
		uiStats.show();
		
		//set up initial game settings
		playGame = false;
		
		asteroids = new Array();
		numAsteroids = 10;
		score=0;
		
		player = new Player(150, canvasHeight/2);
		
		for ( var i = 0; i < numAsteroids; i++) {
			
			var radius = 5+(Math.random()*10);
			var x = canvasWidth+radius+Math.floor(Math.random()*canvasWidth);
			var y = Math.floor(Math.random()*canvasHeight);
			var vX = -5-(Math.random()*5);
			
			asteroids.push(new Asteroid(x, y, radius, vX));
			
		};
		
		$(window).keydown(function(e) {
			
			var keyCode = e.keyCode;
			
			if (!playGame) {
				
				playGame = true;
				soundBackground.currentTime = 0;
				soundBackground.play();
				animate();
				timer();
				
			};
			
			if (keyCode == arrowRight) {
				
				player.moveRight = true;
				if (soundThrust.paused) {
					
					soundThrust.currentTime = 0;
					soundThrust.play();
					
				};
				
			}
			
			else if (keyCode == arrowUp) {
				
				player.moveUp = true;
				
			}
			
			else if (keyCode == arrowDown) {
				
				player.moveDown = true;
				
			};
			
		});
		
		$(window).keyup(function(e) {
			
			var keyCode = e.keyCode;
			
			if (keyCode == arrowRight) {
				
				player.moveRight = false;
				soundThrust.pause();
				
			}
			
			else if (keyCode == arrowUp) {
				
				player.moveUp = false;
				
			}
			
			else if (keyCode == arrowDown) {
				
				player.moveDown = false;
				
			};
			
		});
		
		//start the animation loop
		animate();
		
	};
	
	//initilize the game enviroment
	function init() {
		
		uiStats.hide();
		uiComplete.hide();
		
		uiPlay.click(function(e) {
			
			e.preventDefault();
			uiIntro.hide();
			startGame();
			
		});
		
		uiReset.click(function(e) {
			
			e.preventDefault();
			uiComplete.hide();
			$(window).unbind("keyup");
			$(window).unbind("keydown");
			soundThrust.pause();
			soundBackground.pause();
			clearTimeout(scoreTimeout);
			startGame();
			
		});
		
	};
	
	function timer() {
		
		if (playGame) {
			
			scoreTimeout = setTimeout(function() {
				
				uiScore.html(++score);
				
				if (score % 5 == 0) {
					
					numAsteroids += 5;
					
				};
				timer();
				
			}, 1000);
			
		};
		
	};
	
	//animation function
	function animate() {
		
		//clear
		
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		
		var asteroidsLength = asteroids.length;
		
		for ( var i = 0; i < asteroidsLength; i++) {
			
			var tmpAsteroid = asteroids[i];
			
			tmpAsteroid.x += tmpAsteroid.vX;
			
			if (tmpAsteroid.x+tmpAsteroid.radius < 0) {
				
				tmpAsteroid.radius = 5+(Math.random()*10);
				tmpAsteroid.x = canvasWidth+tmpAsteroid.radius;
				tmpAsteroid.y = Math.floor(Math.random()*canvasHeight);
				tmpAsteroid.vX = -5-(Math.random()*5);
				
			};
			
			
			var dX = player.x - tmpAsteroid.x;
			var dY = player.y - tmpAsteroid.y;
			var distance = Math.sqrt((dX*dX)+(dY*dY));
			
			if (distance < player.halfWidth+tmpAsteroid.radius) {
				
				soundThrust.pause();
				
				soundDeath.currentTime = 0;
				soundDeath.play();
				
				//game over
				playGame = false;
				clearTimeout(scoreTimeout);
				uiStats.hide();
				uiComplete.show();
				
				soundBackground.pause();
				
				$(window).unbind("keyup");
				$(window).unbind("keydown");
				
			};
			
			ctx.fillStyle = "#81BEF7";
			ctx.beginPath();
			ctx.arc(tmpAsteroid.x, tmpAsteroid.y, tmpAsteroid.radius, 0, Math.PI*2, true);
			ctx.closePath();
			ctx.fill();
			
		};
		
		player.vX = 0;
		player.vY = 0;
		
		if (player.moveRight) {
			
			player.vX = 3;
			
		}
		
		else {
			
			player.vX = -3;
			
		};
		
		if (player.moveUp) {
			
			player.vY = -5;
			
		};
		
		if (player.moveDown) {
			
			player.vY = 5;
			
		};
		
		player.x += player.vX;
		player.y += player.vY;
		
		if (player.moveRight) {
			
			ctx.save();
			ctx.translate(player.x-player.halfWidth, player.y);
			
			if (player.flameLength == 40) {
				
				player.flameLength = 35;
				
			}
			
			else {
				
				player.flameLength = 40;
				
			};
			
		};
			
			if (player.x-player.halfWidth < 20) {
				
				player.x = 20+player.halfWidth;
				
			}
			
			else if (player.x+player.halfWidth > canvasWidth-20) {
				
				player.x = canvasWidth-20-player.halfWidth;
				
			}
			
			if (player.y-player.halfHeight < 20) {
				
				player.y = 20+player.halfHeight;
				
			}
			
			else if (player.y+player.halfHeight > canvasHeight-20) {
				
				player.y = canvasHeight-20-player.halfHeight;
				
			};
			
			ctx.fillStyle = "#82FA58";
			ctx.beginPath();
			ctx.moveTo(0, -5);
			ctx.lineTo(-player.flameLength, 0);
			ctx.lineTo(0, 5);
			ctx.closePath();
			ctx.fill();
			
			ctx.restore();
			
		
		
		ctx.fillStyle = "#CC2EFA";
		ctx.beginPath();
		ctx.moveTo(player.x+player.halfWidth, player.y);
		ctx.lineTo(player.x-player.halfWidth, player.y-player.halfHeight);
		ctx.lineTo(player.x-player.halfWidth, player.y+player.halfHeight);
		ctx.closePath();
		ctx.fill();
		
		while (asteroids.length < numAsteroids) {
			
			var radius = 5+(Math.random()*10);
			var x = Math.floor(Math.random()*canvasWidth)+canvasWidth+radius;
			var y = Math.floor(Math.random()*canvasHeight);
			var vX = -5-(Math.random()*5);
			
			asteroids.push(new Asteroid(x, y, radius, vX));
			
		};
		
	
		
		if(playGame) {
			
			//run the animation loop again in 33 miliseconds
			setTimeout(animate,33);
			
		};
		
	};
	
	init();
	
});