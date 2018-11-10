//An exploration of Procedural generation.
var game

document.oncontextmenu = function() {
    return false;
}

window.onload = function(){
	game = new Phaser.Game(1024, 720, Phaser.AUTO, 'game');

	game.state.add('Boot', Boot);
	game.state.add('Play', Play);
	game.state.start('Boot');
}