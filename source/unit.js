var Unit = function (game, x, y, texture){
	//instance variables
	this.selected = false;
	this.range = 5;
	this.tileX = x;
	this.tileY = y;
	//click management
	this.clickDelay = 30;
	this.clickDelayCounter = 0;
	this.clickable = false;


	//highlight
	this.highlight = game.add.group();
	this.reachableTiles = new Array();
	this.arrow = new Array();
	
	// create unit sprite
	Phaser.Sprite.call(this, game, world.tileToPixel(this.tileX), world.tileToPixel(this.tileY), texture);
	
	//set spawn tile as occupied
	world.tiles[this.tileX][this.tileY].isOccupied = true;

	// make it clickable
	this.inputEnabled = true;

	//center it on the tile
	this.anchor.setTo(0.5,0.5);
	
	var _this = this;
	//functions
	this.select = function(){
		if(_this.selected === false){
			_this.loadHighlight();
			_this.selected = true;
			_this.clickable = false;
		}else{
			_this.selected = false;
			_this.clickable = false;
			_this.removeArrow();
		}
	}
	this.loadHighlight = function(){
		this.highlight.destroy;
		this.reachableTiles.length = 0;
		this.highlight = game.add.group();
		for(let point of world.dijkstrasShortestPathToAllAtRange({x:_this.tileX,y:_this.tileY}, _this.range)){
			var highlight = game.add.image(world.tileToPixel(point.x), world.tileToPixel(point.y), 'movement', 'highlight');
			highlight.alpha = 0.5;
			highlight.anchor.setTo(0.5,0.5);
			_this.highlight.add(highlight);
			_this.reachableTiles.push(point);
		}		
	}
	this.buildArrow = function(path){
		this.removeArrow();
		placeArrow = function(x, y, priorDirection, direction){
			let arrowPiece = null;
			if(priorDirection == direction){
				arrowPiece = game.add.image(x, y, 'movement', 'straight');
				arrowPiece.anchor.setTo(0.5, 0.5);
				if(direction == 'right'){
					arrowPiece.angle = 90;
				}else if(direction == 'down'){
					arrowPiece.angle = 180;
				}else if(direction == 'left'){
					arrowPiece.angle = 270;
				}
			}else{
				arrowPiece = null 
				if(priorDirection == 'right' && direction == 'down'){
					arrowPiece = game.add.image(x, y, 'movement', 'right');
					arrowPiece.angle = 90;
				}else if(priorDirection == 'down' && direction == 'left'){
					arrowPiece = game.add.image(x, y, 'movement', 'right');
					arrowPiece.angle = 180;
				}else if(priorDirection == 'left' && direction == 'up'){
					arrowPiece = game.add.image(x, y, 'movement', 'right');
					arrowPiece.angle = 270;
				}else if(priorDirection == 'up' && direction == 'right'){
					arrowPiece = game.add.image(x, y, 'movement', 'right');
				}
				else if(priorDirection == 'right' && direction == 'up'){
					arrowPiece = game.add.image(x, y, 'movement', 'left');
					arrowPiece.angle = 90;
				}else if(priorDirection == 'down' && direction == 'right'){
					arrowPiece = game.add.image(x, y, 'movement', 'left');
					arrowPiece.angle = 180;
				}else if(priorDirection == 'left' && direction == 'down'){
					arrowPiece = game.add.image(x, y, 'movement', 'left');
					arrowPiece.angle = 270;
				}else{
					arrowPiece = game.add.image(x, y, 'movement', 'left');
				}
				arrowPiece.anchor.setTo(0.5, 0.5);
			}
			_this.arrow.push(arrowPiece);
		}
		//place destination arrow
		let destination = game.add.image(path[path.length - 1].x*world.tileSize + world.tileSize/2, path[path.length - 1].y*world.tileSize + world.tileSize/2, 'movement', 'arrow');
		destination.anchor.setTo(0.5, 0.5);
		let finalDirection = '';
		let penultimatePoint = null;
		// find direction
		if(path.length > 1){
			penultimatePoint = path[path.length - 2];
		}else{
			penultimatePoint = {x:this.tileX,y:this.tileY}
		}
		if(penultimatePoint.x < path[path.length - 1].x){
			finalDirection = 'right';
		}else if(penultimatePoint.x > path[path.length - 1].x){
			finalDirection = 'left';
		}else if(penultimatePoint.y < path[path.length - 1].y){
			finalDirection = 'down';
		}else{
			finalDirection = 'up';
		}
		// rotate arrow based on direction
		if(finalDirection == 'right'){
			destination.angle = 90;
		}else if(finalDirection == 'down'){
			destination.angle = 180;
		}else if(finalDirection == 'left'){
			destination.angle = 270;
		}
		_this.arrow.push(destination);
		//place other arrows
		for(var i = path.length - 1; i > 0; i--){
 			let posx = path[i-1].x*world.tileSize + world.tileSize/2;
 			let posy = path[i-1].y*world.tileSize + world.tileSize/2;
 			let direction = '';
 			let priorDirection = '';
 			// calculate direction from points
 			if(path[i-1].x < path[i].x){
 				direction = 'right';
 			}else if(path[i-1].x > path[i].x){
 				direction = 'left';
 			}else if(path[i-1].y < path[i].y){
 				direction = 'down';
 			}else{
 				direction = 'up';
 			}
 			//calculate prior direction from points
 			if(i!=1){
	 			if(path[i-2].x < path[i-1].x){
	 				priorDirection = 'right';
	 			}else if(path[i-2].x > path[i-1].x){
	 				priorDirection = 'left';
	 			}else if(path[i-2].y < path[i-1].y){
	 				priorDirection = 'down';
	 			}else{
	 				priorDirection = 'up';
	 			}
 			}else{
 				if(this.tileX < path[i-1].x){
	 				priorDirection = 'right';
	 			}else if(this.tileX > path[i-1].x){
	 				priorDirection = 'left';
	 			}else if(this.tileY < path[i-1].y){
	 				priorDirection = 'down';
	 			}else{
	 				priorDirection = 'up';
	 			}
 			}
 			placeArrow(posx, posy, priorDirection, direction);
		}
	}
	this.removeArrow = function(){
		let len = this.arrow.length
		for(var i = 0; i < len; i++){
			this.arrow.pop().destroy();
		}
	}
	this.events.onInputDown.add(this.select, game);
}

Unit.prototype = Object.create(Phaser.Sprite.prototype);
Unit.prototype.constructor = Unit;

Unit.prototype.update = function(){
	// selection handling
	if(this.selected === true){
		this.highlight.visible = true;
		// if highlighted tile clicked while selected
		if(game.input.activePointer.leftButton.isDown && this.clickable){
			//get mouse co-ords
			let pos = world.mouseTilePos();
			var reachable = false;
			for(var i = 0; i < this.reachableTiles.length; i++){
				if(this.reachableTiles[i].x == pos.x && this.reachableTiles[i].y == pos.y){
					reachable = true;
				}
			}
			//only move if tile is reachable
			if(reachable){
				//remove display arrow
				this.removeArrow();
				//original tile no longer occupied
				world.tiles[this.tileX][this.tileY].isOccupied = false;
				//auto deselect after movement
				this.select();
				//update position
				this.tileX = pos.x;
				this.tileY = pos.y;
				this.x = world.tileToPixel(pos.x);
				this.y = world.tileToPixel(pos.y);
				//tile at new pos is occupied
				world.tiles[this.tileX][this.tileY].isOccupied = true;
			}
			this.clickable = false;
		}
		// click delay
		if(this.clickable == false){
			if(this.clickDelay > this.clickDelayCounter){
				this.clickDelayCounter++;
			}else{
				this.clickable = true;
				this.clickDelayCounter = 0;
			}
		}
		let pos = world.mouseTilePos();
		if(pos.x != this.tileX || pos.y != this.tileY){
			path = world.dijkstrasShortestPathAtRange({x:this.tileX,y:this.tileY}, pos, this.range)
			if(path){
				this.buildArrow(path);
			}
		}
	}else{
		this.highlight.visible = false;
	}
}