var world;

var Play = function(game){};

Play.prototype = {
	create: function() {
		game.world.setBounds(0, 0, 2048, 1440);
		game.stage.backgroundColor = "#CCCCCC";
		//game.camera.scale.x /= 2;
		//game.camera.scale.y /= 2;

		//create world
		world = new World(game, 64, 45);
		game.add.existing(world);
		world.generate();
		
		
		//create a unit
		var x = Math.floor(Math.random() * 64);
		var y = Math.floor(Math.random() * 45);
		while(world.tiles[x][y].isLand == false || world.tiles[x][y].isOccupied == true){
			x = Math.floor(Math.random() * 64);
			y = Math.floor(Math.random() * 45); 
		}

		this.unit = new Unit(game, x, y, "unit");
		game.add.existing(this.unit);

		//create a unit
		var x2 = Math.floor(Math.random() * 64);
		var y2 = Math.floor(Math.random() * 45);
		while(world.tiles[x2][y2].isLand == false || world.tiles[x2][y2].isOccupied == true){
			x2 = Math.floor(Math.random() * 64);
			y2 = Math.floor(Math.random() * 45); 
		}

		this.unit2 = new Unit(game, x2, y2, "unit");
		game.add.existing(this.unit2);
		this.unit2.range = 10;

		cursors = game.input.keyboard.createCursorKeys();
	},
	
	update: function() {
		//world.seedNoise();
		//world.generate();
		//game.world.bringToTop(this.unit);
		cameraSpeed = 4;
		if (cursors.up.isDown)
	    {
	        game.camera.y -= cameraSpeed;
	    }
	    else if (cursors.down.isDown)
	    {
	        game.camera.y += cameraSpeed;
	    }

	    if (cursors.left.isDown)
	    {
	        game.camera.x -= cameraSpeed;
	    }
	    else if (cursors.right.isDown)
	    {
	        game.camera.x += cameraSpeed;
	    }
	}
}

ndp = function(posx, posy){ return {x:posx, y:posy}};