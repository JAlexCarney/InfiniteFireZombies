var Boot = function(game){};

Boot.prototype = {
	preload: function() {
		//load world atlas
		game.load.atlas('atlas', 'assets/atlas.png', 'assets/atlas.json');
		game.load.image('tree', 'assets/tree.png');
		//load units
		game.load.image('unit', 'assets/unit.png');
		//load movement arrows
		game.load.atlas('movement', 'assets/movement.png', 'assets/movement.json')
		//load sound
	},
	
	create: function() {
		//start play state
		game.state.start('Play');
	}
}