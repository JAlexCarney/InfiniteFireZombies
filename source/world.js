var World = function (game, width, height, noiseSpanX, noiseSpanY){
	//defult noise span
	if(noiseSpanX == null){
		noiseSpanX = 2
	}
	if(noiseSpanY == null){
		noiseSpanY = 1
	}

	// World implemented as phaser group
	Phaser.Group.call(this, game);

	// instance variables
	this.widthInTiles = width;
	this.heightInTiles = height;
	this.tileSize = 32;
	this.tiles = new Array(width); for(var i = 0; i < width; i++){ this.tiles[i] = new Array(height); }
	this.trees = new Array(0); 
	this.simplex = new SimplexNoise();
	this.noiseXOffset = 0;
	this.noiseYOffset = 0;

	//instantiate noise
	this.seedNoise = function(){
		this.simplex = new SimplexNoise();
		this.noiseXOffset = 0;
		this.noiseYOffset = 0;
	}
	
	//populate tiles
	this.generate = function(){
		//destroy pre-existing tiles
		if(this.tiles[0][0] != null){
			for(var i = 0; i < this.widthInTiles; i++)
			{
				for(var j = 0; j < this.heightInTiles; j++)
				{
					this.tiles[i][j].destroy();
				}
			}
		}
		//destroy pre-existing trees
		if(this.trees.length > 0){
			for(var i = 0; i < this.trees.length; i++){
				this.trees[i].destroy();
			}
		}


		for(var i = 0; i < width; i++){
			for(var j = 0; j < height; j++){
				//generate noise
				// first octave
				var noiseX = this.noiseXOffset + (i/width)*noiseSpanX;
				var noiseY = this.noiseYOffset + (j/height)*noiseSpanY;
				var noiseVal = (this.simplex.noise2D(noiseX, noiseY) + 1)/2;
				// second octave
				noiseX *= 2;
				noiseY *= 2; 
				noiseVal += ((this.simplex.noise2D(noiseX, noiseY) + 1)/2) * 0.5;
				noiseVal /= 1.5;
				// convert noise to int from 0 to 9
				let rnd = Math.trunc(10 * noiseVal);
				var type = '';

				// convert noise to tile sprite IDs
				if(rnd == 1 || rnd == 0)
				{
					type = 'deep_water';
				}else if(rnd == 2)
				{
					type = 'water';
				}else if(rnd == 3)
				{
					type = 'shallow_water';
				}else if(rnd == 4)
				{
					type = 'sand';
				}else if(rnd == 5 || rnd == 6)
				{
					type = 'grass';
				}else if(rnd == 7)
				{
					type = 'mountain_grass';
				}else if(rnd == 8)
				{
					type = 'stone';
				}else if(rnd == 9)
				{
					type = 'snow';
				}

				//create tile sprite
				var tile = new Tile(game, i, j, type);
				game.add.existing(tile);
				
				// add tile to world
				this.tiles[i][j] = tile;

				// chance to place plants
				if(type == 'mountain_grass' && Math.random() > 0.6){
					let tree = new Tree(game, i, j);
					game.add.existing(tree);
					this.trees.push(tree);
				}
			}
		}

		console.log('generated!');
	}

	this.mouseTilePos = function() {
		return new Phaser.Point(
			Math.floor(game.input.mousePointer.x/this.tileSize + game.camera.x/this.tileSize),
			Math.floor(game.input.mousePointer.y/this.tileSize + game.camera.y/this.tileSize)
			);	
	}

	this.adjacentPoints = function(source){
		adjPoints = [];
		if(source.y-1 >= 0){
			if(this.tiles[source.x][source.y-1].isLand && !this.tiles[source.x][source.y-1].isOccupied){
				adjPoints.push({x:source.x,y:source.y-1});
			}
		}
		if(source.y+1 < this.heightInTiles){
			if(this.tiles[source.x][source.y+1].isLand && !this.tiles[source.x][source.y+1].isOccupied){
				adjPoints.push({x:source.x,y:source.y+1});
			}
		}
		if(source.x-1 >= 0){
			if(this.tiles[source.x-1][source.y].isLand && !this.tiles[source.x-1][source.y].isOccupied){
				adjPoints.push({x:source.x-1,y:source.y});
			}
		}
		if(source.x+1 < this.widthInTiles){
			if(this.tiles[source.x+1][source.y].isLand && !this.tiles[source.x+1][source.y].isOccupied){
				adjPoints.push({x:source.x+1,y:source.y});
			}
		}
		return adjPoints;
	}
	
	this.dijkstrasShortestPathToAllAtRange = function(startPoint, range){
		// Takes in a starting point in tile coordinates and a maximum range of movement in tile costs
		// returns a list of the form [(x,y),(x,y), ..., (x,y)] of all reachable points
	
		//initialize empty priority queue
		queue = new Queue();

		//seen positions
		seen = [startPoint];

		//add source to queue
		queue.push(0, startPoint);

		while(queue.length > 0){
			//pop point at cost
			poped = queue.pop();
			currentCost = poped.priority;
			currentPosition = poped.obj;

			//expand position
			adjacentPoints = this.adjacentPoints(currentPosition);
			for(let point of adjacentPoints){
				inSeen = false;
				for(var i = 0; i < seen.length; i++){
					if(seen[i].x == point.x && seen[i].y == point.y){
						inSeen = true;
					}
				}
				if(!inSeen && currentCost < range){
					seen.push(point);
					queue.push(currentCost + this.tiles[point.x][point.y].moveCost, point)
				}
			}
		}
		seen.shift();
		return seen;
	}
	
	this.dijkstrasShortestPathAtRange = function(startPoint, destinationPoint, range){
		// Takes in a starting point in tile coordinates and a maximum range of movement in tile costs
		// returns a list of the form [(x,y),(x,y), ..., (x,y)] not including the start point
	
		//initialize empty priority queue
		queue = new Queue();

		//backpointers
		backpointers = new Array(this.widthInTiles);
		for(var i = 0; i<this.widthInTiles;i++){
			backpointers[i] = new Array(this.heightInTiles);
		}

		//seen positions
		seen = [startPoint]; 

		//add source to queue
		queue.push(0, startPoint);

		while(queue.length > 0){
			poped = queue.pop();
			currentCost = poped.priority;
			currentPosition = poped.obj;

			if(currentPosition.x == destinationPoint.x && currentPosition.y == destinationPoint.y){
				//build path
				path = [];

				backpoint = currentPosition;
				while(backpoint.x != startPoint.x || backpoint.y != startPoint.y){
					path.unshift(backpoint);
					backpoint = backpointers[backpoint.x][backpoint.y];
				}

				return path;
			}

			//expand position
			adjacentPoints = this.adjacentPoints(currentPosition);
			for(let point of adjacentPoints){
				inSeen = false;
				for(var i = 0; i < seen.length; i++){
					if(seen[i].x == point.x && seen[i].y == point.y){
						inSeen = true;
					}
				}
				if(!inSeen && currentCost < range){
					seen.push(point);
					queue.push(currentCost + this.tiles[point.x][point.y].moveCost, point)
					backpointers[point.x][point.y] = currentPosition;
				}
			}
		}
		return null;
	}

	this.tileToPixel = function(x){
		return x*this.tileSize + this.tileSize/2
	}
}

World.prototype = Object.create(Phaser.Group.prototype);
World.prototype.constructor = World;

World.prototype.update = function(){
	
}

var Tile = function (game, tileX, tileY, type){
	// instance variables
	this.terrainType = type;
	this.isLand = true;
	this.moveCost = 1;
	this.isOccupied = false;

	// is this tile land?
	if(this.terrainType == 'deep_water' || this.terrainType == 'water' || this.terrainType == 'shallow_water'){
		this.isLand = false;
	}

	// set move cost
	else if(this.terrainType == 'sand'){
		this.moveCost = 2;
	}else if(this.terrainType == 'stone'){
		this.moveCost = 3;
	}else if(this.terrainType == 'snow'){
		this.moveCost = 3;
	}

	//convert tiles to real coords
	let x = world.tileToPixel(tileX);
	let y = world.tileToPixel(tileY);

	Phaser.Sprite.call(this, game, x, y, 'atlas', type);

	this.anchor.setTo(0.5, 0.5);
	if(this.isLand){
		rnd = Math.random();
		if(rnd < 0.25){
			this.angle = 0;
		}else if(rnd < 0.5){
			this.angle = 90;
		}else if(rnd < 0.75){
			this.angle = 180;
		}else{
			this.angle = 270;
		}
	}
}

Tile.prototype = Object.create(Phaser.Sprite.prototype);
Tile.prototype.constructor = Tile;

var Tree = function (game, tileX, tileY){
	//convert tiles to real coords
	let x = world.tileToPixel(tileX);;
	let y = world.tileToPixel(tileY);

	//mark tile as occupied
	world.tiles[tileX][tileY].isOccupied = true;

	Phaser.Sprite.call(this, game, x, y, 'tree');

	this.anchor.setTo(0.5,0.5);
}

Tree.prototype = Object.create(Phaser.Sprite.prototype);
Tree.prototype.constructor = Tree;