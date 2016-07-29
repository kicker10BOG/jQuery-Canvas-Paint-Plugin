// Author: Jason L. Bogle
// Date: 7/14/2016
// Last Updated: 7/28/2016
// Version: 0.4.0
// Description: An attempt at a basic drawing app using Canvas
//		this defines objects

function CanvasPaintObjectFactory(owner) {
	var base = this;
	base.owner = owner;
	
	base.drawingObject = function(data, obj) {
		obj.tool = data.tool;
		obj.id = data.id;
		obj.order = data.order;
		obj.layer = data.layer;
		
		obj.erased = [];
		
		obj.genCanvas = function() {
			// add new canvas for the new object
			obj.bigCanvas = $("<canvas>").attr({
				height: obj.layer.manager.owner.options.canvHeight,
				width: obj.layer.manager.owner.options.canvWidth
			}).addClass("canvasPaintObjectCanvas").css("z-index", obj.layer.order*1000 + obj.order);
			obj.layer.manager.owner.canvasDiv.append(obj.bigCanvas);
			obj.bigContext = obj.bigCanvas[0].getContext("2d");
		}
		
		obj.genCanvas();
		
		obj.delCanvas = function() {
			this.bigCanvas.remove();
			delete this.bigContext;
		}
		
		obj.drawOnContextAsImg = function(ctx) {
			this.draw();
			ctx.drawImage(this.bigCanvas[0], 0, 0);
		}
		
		obj.show = function() {
			this.bigCanvas.show();
		}
		
		obj.hide = function() {
			this.bigCanvas.hide();
		}
		
		obj.setOrder = function(newOrder) {
			this.order = newOrder;
			this.bigCanvas.css("z-index", this.layer.order * 1000 + newOrder);
		}
		
		obj.setLayerOrder = function() {
			//console.log(this);
			this.setOrder(this.order);
		}
		
		obj.computeVisualBounds = function() {
			var pbounds = this.bounds.points;
			var vbounds = this.bounds.visual;
			var imgData = this.bigContext.getImageData(
				pbounds.left,
				pbounds.top,
				pbounds.right - pbounds.left,
				pbounds.bottom - pbounds.top
			)
			var height = imgData.height;
			var width = imgData.width;
			var data = imgData.data;
			var x, y, found;
			// get left
			found = false;
			for (x = 0; x < width && !found; x++) {
				for (y = 0; y < height && !found; y++) {
					if(data[((y * width) + x) * 4 + 3] > 0) {
						vbounds.left = x + pbounds.left;
						found = true;
					}
				}
			}
			// get top
			found = false;
			for (y = 0; y < height && !found; y++) {
				for (x = 0; x < width && !found; x++) {
					if(data[((y * width) + x) * 4 + 3] > 0) {
						vbounds.top = y + pbounds.top;
						found = true;
					}
				}
			}
			// get right
			found = false;
			for (x = width - 1; x > 0 && !found; x--) {
				for (y = 0; y < height && !found; y++) {
					if(data[((y * width) + x) * 4 + 3] > 0) {
						vbounds.right = x + pbounds.left;
						found = true;
					}
				}
			}
			// get bottom
			found = false;
			for (y = height - 1; y > 0 && !found; y--) {
				for (x = 0; x < width && !found; x++) {
					if(data[((y * width) + x) * 4 + 3] > 0) {
						vbounds.bottom = y + pbounds.top;
						found = true;
					}
				}
			}
		}
		
		obj.drawPointsBoundingBox = function() {
			this.bigContext.setLineDash([6]);
			this.bigContext.lineWidth = 4;
			this.bigContext.strokeStyle = "#000000";
			this.bigContext.beginPath();
			this.bigContext.globalCompositeOperation = "source-over";
			this.bigContext.rect(
				this.bounds.points.left,
				this.bounds.points.top,
				this.bounds.points.right - this.bounds.points.left,
				this.bounds.points.bottom - this.bounds.points.top
			);
			this.bigContext.stroke();
			this.bigContext.setLineDash([0]);
		}
		
		obj.drawVisualBoundingBox = function() {
			this.bigContext.setLineDash([6]);
			this.bigContext.lineWidth = 4;
			this.bigContext.strokeStyle = "#000000";
			this.bigContext.beginPath();
			this.bigContext.globalCompositeOperation = "source-over";
			this.bigContext.rect(
				this.bounds.visual.left,
				this.bounds.visual.top,
				this.bounds.visual.right - this.bounds.visual.left,
				this.bounds.visual.bottom - this.bounds.visual.top
			);
			this.bigContext.stroke();
			this.bigContext.setLineDash([0]);
		}
		return this;
	}
	
	base.paintObject = function(data) {
		//console.log(data);
		base.drawingObject(data, this);
		this.type = "paint";
		this.strokes = [];
		this.strokes.push({
			points : [{
				x: data.mX,
				y: data.mY
			}],
			tool: data.tool,
			strokeColor: base.owner.TM.strokeColor,
			strokeWidth: base.owner.TM.strokeWidth,
			strokeOpacity: base.owner.TM.strokeOpacity,
			bounds: {
				left: data.mX - base.owner.TM.strokeWidth / 2,
				top: data.mY - base.owner.TM.strokeWidth / 2,
				right: data.mX + base.owner.TM.strokeWidth / 2,
				bottom: data.mY + base.owner.TM.strokeWidth / 2
			}
		});
		this.bounds = {points:{}, visual: {}};
		this.bounds.points.left = data.mX - this.strokes[0].strokeWidth / 2;
		this.bounds.points.top = data.mY - this.strokes[0].strokeWidth / 2;
		this.bounds.points.right = data.mX + this.strokes[0].strokeWidth / 2;
		this.bounds.points.bottom = data.mY + this.strokes[0].strokeWidth / 2;
		this.bounds.visual.left = data.mX - this.strokes[0].strokeWidth / 2;
		this.bounds.visual.top = data.mY - this.strokes[0].strokeWidth / 2;
		this.bounds.visual.right = data.mX + this.strokes[0].strokeWidth / 2;
		this.bounds.visual.bottom = data.mY + this.strokes[0].strokeWidth / 2;
		//console.log(this);
		
		this.addPoint = function(data) {
			//console.log(data);
			if (data.dragging) {
				var stroke = this.strokes[this.strokes.length - 1];
				stroke.points.push({
					x: data.mX,
					y: data.mY
				});
				// update stroke bounds
				var swidth = stroke.strokeWidth / 2;
				if (data.mX - swidth < stroke.bounds.left) {
					stroke.bounds.left = data.mX - swidth;
				}
				if (data.mY - swidth < stroke.bounds.top) {
					stroke.bounds.top = data.mY - swidth;
				}
				if (data.mX + swidth > stroke.bounds.right) {
					stroke.bounds.right = data.mX + swidth;
				}
				if (data.mY + swidth > stroke.bounds.bottom) {
					stroke.bounds.bottom = data.mY + swidth;
				}
			}
			else {
				this.isBlank = false;
				this.strokes.push({
					points : [{
						x: data.mX,
						y: data.mY
					}],
					tool: data.tool,
					strokeColor: base.owner.TM.strokeColor,
					strokeWidth: base.owner.TM.strokeWidth,
					strokeOpacity: base.owner.TM.strokeOpacity,
					bounds: {
						left: data.mX - base.owner.TM.strokeWidth / 2,
						top: data.mY - base.owner.TM.strokeWidth / 2,
						right: data.mX + base.owner.TM.strokeWidth / 2,
						bottom: data.mY + base.owner.TM.strokeWidth / 2
					}
				});
			}
			return this.strokes[this.strokes.length - 1];
		}
		
		this.addErasePoint = function(data) {
			return this.addPoint(data);
		}
		
		this.undoErase = function() {
			this.strokes.pop();
			this.isBlank = false;
		}
		
		this.redoErase = function(stroke) {
			this.strokes.push(stroke);
		}
		
		this.draw = function() {
			//console.log("draw: ");
			//console.log(this);
			if (this.isBlank) {
				return;
			}
			this.bigContext.clearRect(0, 0, this.bigContext.canvas.width, this.bigContext.canvas.height);
			this.bigContext.lineJoin = "round";
			this.bigContext.lineCap = "round";
			for(var s = 0; s < this.strokes.length; s++) {
				this.bigContext.beginPath();
				this.bigContext.strokeStyle = this.strokes[s].strokeColor;
				this.bigContext.globalAlpha = this.strokes[s].strokeOpacity * this.layer.opacity;
				this.bigContext.lineWidth = this.strokes[s].strokeWidth;
				if (this.strokes[s].tool == "paint") {
					//console.log("paint");
					this.bigContext.globalCompositeOperation = "source-over";
				}
				else if (this.strokes[s].tool == "eraser") {
					//console.log("erase");
					this.bigContext.globalCompositeOperation = "destination-out";
				}
				else {
					//console.log("tool: " + this.strokes[s].tool);
				}
				for (var i = 0; i < this.strokes[s].points.length; i++) {
					//console.log(i);
					if (i == 0) {
						this.bigContext.moveTo(this.strokes[s].points[i].x, this.strokes[s].points[i].y);
						this.bigContext.lineTo(this.strokes[s].points[i].x + 0.001, this.strokes[s].points[i].y);
					}
					this.bigContext.lineTo(this.strokes[s].points[i].x, this.strokes[s].points[i].y);
				}
				this.bigContext.stroke();
			}
			
			this.layer.previewContext.drawImage(this.bigCanvas[0], 0, 0);
			if (this.bigCanvas[0].toDataURL() == base.owner.LM.blankData) {
				//console.log("completely erased");
				this.isBlank = true;
			}
		}
		
		this.computePointsBounds = function() {
			var ctx = this.bigContext;
			var bounds = this.bounds.points;
			bounds.left = undefined;
			bounds.top = undefined;
			bounds.right = undefined;
			bounds.bottom = undefined;
			//var s = 0;
			this.strokes.forEach(function(stroke){
				//console.log(s++);
				if (stroke.tool == "paint") {
					if (!bounds.left || stroke.bounds.left < bounds.left) {
						bounds.left = stroke.bounds.left;
					}
					if (!bounds.top || stroke.bounds.top < bounds.top) {
						bounds.top = stroke.bounds.top;
					}
					if (!bounds.right || stroke.bounds.right > bounds.right) {
						bounds.right = stroke.bounds.right;
					}
					if (!bounds.bottom || stroke.bounds.bottom > bounds.bottom) {
						bounds.bottom = stroke.bounds.bottom;
					}
				}
			});
		}
		
		return this;
	}
	
	// Rectangle Object
	base.rectangleObject = function(data) {
		//console.log(data);
		base.drawingObject(data, this);
		this.type = "rectangle";
		
		this.fillColor = base.owner.TM.fillColor;
		this.fillOpacity = base.owner.TM.fillOpacity;
		this.outlineColor = base.owner.TM.outlineColor;
		this.outlineColor = base.owner.TM.outlineColor;
		this.outlineWidth = base.owner.TM.outlineWidth;
		this.outlineOpacity = base.owner.TM.outlineOpacity;
		
		this.points = {
			p1 : {
				x: data.mX,
				y: data.mY
			},
			p2 : {
				x: data.mX,
				y: data.mY
			},
			topLeft : {
				x: data.mX,
				y: data.mY
			},
			height: 0.00001,
			width: 0.00001
		};
		
		this.bounds = {points:{}, visual: {}};
		
		this.erased = {strokes: []};
		//console.log(this);
		
		this.updateRectangle = function(data) {
			//console.log(data);
			this.isBlank = false;
			this.points.p2.x = data.mX;
			this.points.p2.y = data.mY;
			// get top left, width, and height
			this.points.topLeft.x = Math.min(this.points.p1.x, this.points.p2.x);
			this.points.topLeft.y = Math.min(this.points.p1.y, this.points.p2.y);
			this.points.width = Math.max(this.points.p1.x, this.points.p2.x) -  this.points.topLeft.x;
			this.points.height = Math.max(this.points.p1.y, this.points.p2.y) -  this.points.topLeft.y;  
		}
		
		this.addErasePoint = function(data) {
			//return this.addPoint(data);
			if (data.dragging) {
				var stroke = this.erased.strokes[this.erased.strokes.length - 1];
				stroke.points.push({
					x: data.mX,
					y: data.mY
				});
			}
			else {
				this.erased.strokes.push({
					points: [{
						x: data.mX,
						y: data.mY
					}],
					strokeWidth: base.owner.TM.strokeWidth,
					strokeOpacity: base.owner.TM.strokeOpacity
				});
			}
			return this.erased.strokes[this.erased.strokes.length - 1];
		}
		
		this.undoErase = function() {
			this.erased.strokes.pop();
			this.isBlank = false;
		}
		
		this.redoErase = function(stroke) {
			this.erased.strokes.push(stroke);
		}
		
		this.draw = function() {
			//console.log("draw: ");
			//console.log(this);
			if (this.isBlank) {
				return;
			}
			var ctx = this.bigContext;
			ctx.clearRect(0, 0, this.bigContext.canvas.width, this.bigContext.canvas.height);
			
			var owidth = parseInt(this.outlineWidth);
			ctx.globalCompositeOperation = "source-over";
			ctx.fillStyle = this.fillColor;
			ctx.globalAlpha = this.fillOpacity * this.layer.opacity;
			if (owidth * this.outlineOpacity > 0) {
				// fill
				ctx.fillRect(
					this.points.topLeft.x + owidth,
					this.points.topLeft.y + owidth,
					this.points.width - owidth * 2,
					this.points.height - owidth * 2
				);
				// outline
				//ctx.beginPath();
				ctx.strokeStyle = this.outlineColor;
				ctx.lineWidth = owidth;
				ctx.globalAlpha = this.outlineOpacity * this.layer.opacity;
				ctx.lineJoin = "miter";
				ctx.lineCap = "butt";
				ctx.strokeRect(
					this.points.topLeft.x + owidth / 2,
					this.points.topLeft.y + owidth / 2,
					this.points.width - owidth,
					this.points.height - owidth
				);
			}
			else {
				// fill
				ctx.fillRect(
					this.points.topLeft.x,
					this.points.topLeft.y,
					this.points.width,
					this.points.height
				);
			}
			
			
			//erase
			ctx.globalCompositeOperation = "destination-out";
			this.erased.strokes.forEach(function(stroke) {
				ctx.beginPath();
				ctx.lineWidth = stroke.strokeWidth;
				ctx.globalAlpha = stroke.strokeOpacity;
				ctx.lineJoin = "round";
				ctx.lineCap = "round";
				for (var i = 0; i < stroke.points.length; i++) {
					//console.log(i);
					if (i == 0) {
						ctx.moveTo(stroke.points[i].x, stroke.points[i].y);
						ctx.lineTo(stroke.points[i].x + 0.001, stroke.points[i].y);
					}
					ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
				}
				ctx.stroke();
			});
			
			
			this.layer.previewContext.drawImage(this.bigCanvas[0], 0, 0);
			if (this.bigCanvas[0].toDataURL() == base.owner.LM.blankData) {
				//console.log("completely erased");
				this.isBlank = true;
			}
		}
		
		this.computePointsBounds = function() {
			var ctx = this.bigContext;
			var bounds = this.bounds.points;
			bounds.left = this.points.topLeft.x;
			bounds.top = this.points.topLeft.y;
			bounds.right = this.points.topLeft.x + this.points.topLeft. width;
			bounds.bottom = this.points.topLeft.y + this.points.topLeft.height;
		}
		
		return this;
	}
}

/*


	
	base.paintObject = function(data) {
		//console.log(data);
		base.drawingObject(data, this);
		this.type = "paint";
		this.strokes = [];
		this.strokes.push({
			points : [{
				x: data.mX,
				y: data.mY
			}],
			tool: data.tool,
			strokeColor: base.owner.TM.strokeColor,
			strokeWidth: base.owner.TM.strokeWidth,
			strokeOpacity: base.owner.TM.strokeOpacity,
			bounds: {
				left: data.mX - base.owner.TM.strokeWidth / 2,
				top: data.mY - base.owner.TM.strokeWidth / 2,
				right: data.mX + base.owner.TM.strokeWidth / 2,
				bottom: data.mY + base.owner.TM.strokeWidth / 2
			}
		});
		this.bounds = {points:{}, visual: {}};
		this.bounds.points.left = data.mX - this.strokes[0].strokeWidth / 2;
		this.bounds.points.top = data.mY - this.strokes[0].strokeWidth / 2;
		this.bounds.points.right = data.mX + this.strokes[0].strokeWidth / 2;
		this.bounds.points.bottom = data.mY + this.strokes[0].strokeWidth / 2;
		this.bounds.visual.left = data.mX - this.strokes[0].strokeWidth / 2;
		this.bounds.visual.top = data.mY - this.strokes[0].strokeWidth / 2;
		this.bounds.visual.right = data.mX + this.strokes[0].strokeWidth / 2;
		this.bounds.visual.bottom = data.mY + this.strokes[0].strokeWidth / 2;
		//console.log(this);
		
		this.addPoint = function(data) {
			//console.log(data);
			if (data.dragging) {
				var stroke = this.strokes[this.strokes.length - 1];
				stroke.points.push({
					x: data.mX,
					y: data.mY
				});
				// update stroke bounds
				var swidth = stroke.strokeWidth / 2;
				if (data.mX - swidth < stroke.bounds.left) {
					stroke.bounds.left = data.mX - swidth;
				}
				if (data.mY - swidth < stroke.bounds.top) {
					stroke.bounds.top = data.mY - swidth;
				}
				if (data.mX + swidth > stroke.bounds.right) {
					stroke.bounds.right = data.mX + swidth;
				}
				if (data.mY + swidth > stroke.bounds.bottom) {
					stroke.bounds.bottom = data.mY + swidth;
				}
			}
			else {
				this.strokes.push({
					points : [{
						x: data.mX,
						y: data.mY
					}],
					tool: data.tool,
					strokeColor: base.owner.TM.strokeColor,
					strokeWidth: base.owner.TM.strokeWidth,
					strokeOpacity: base.owner.TM.strokeOpacity,
					bounds: {
						left: data.mX - base.owner.TM.strokeWidth / 2,
						top: data.mY - base.owner.TM.strokeWidth / 2,
						right: data.mX + base.owner.TM.strokeWidth / 2,
						bottom: data.mY + base.owner.TM.strokeWidth / 2
					}
				});
			}
			return this.strokes[this.strokes.length - 1];
		}
		
		this.addErasePoint = function(data) {
			return this.addPoint(data);
		}
		
		this.undoErase = function() {
			this.strokes.pop();
			this.isBlank = false;
		}
		
		this.redoErase = function(stroke) {
			this.strokes.push(stroke);
		}
		
		this.draw = function() {
			//console.log("draw: ");
			//console.log(this);
			if (this.isBlank) {
				return;
			}
			this.bigContext.clearRect(0, 0, this.bigContext.canvas.width, this.bigContext.canvas.height);
			this.bigContext.lineJoin = "round";
			this.bigContext.lineCap = "round";
			for(var s = 0; s < this.strokes.length; s++) {
				this.bigContext.beginPath();
				this.bigContext.strokeStyle = this.strokes[s].strokeColor;
				this.bigContext.globalAlpha = this.strokes[s].strokeOpacity * this.layer.opacity;
				this.bigContext.lineWidth = this.strokes[s].strokeWidth;
				if (this.strokes[s].tool == "paint") {
					//console.log("paint");
					this.bigContext.globalCompositeOperation = "source-over";
				}
				else if (this.strokes[s].tool == "eraser") {
					//console.log("erase");
					this.bigContext.globalCompositeOperation = "destination-out";
				}
				else {
					//console.log("tool: " + this.strokes[s].tool);
				}
				for (var i = 0; i < this.strokes[s].points.length; i++) {
					//console.log(i);
					if (i == 0) {
						this.bigContext.moveTo(this.strokes[s].points[i].x, this.strokes[s].points[i].y);
						this.bigContext.lineTo(this.strokes[s].points[i].x + 0.001, this.strokes[s].points[i].y);
					}
					this.bigContext.lineTo(this.strokes[s].points[i].x, this.strokes[s].points[i].y);
				}
				this.bigContext.stroke();
			}
			
			this.layer.previewContext.drawImage(this.bigCanvas[0], 0, 0);
			if (this.bigCanvas[0].toDataURL() == base.owner.LM.blankData) {
				//console.log("completely erased");
				this.isBlank = true;
			}
		}
		
		this.computePointsBounds = function() {
			var ctx = this.bigContext;
			var bounds = this.bounds.points;
			bounds.left = undefined;
			bounds.top = undefined;
			bounds.right = undefined;
			bounds.bottom = undefined;
			//var s = 0;
			this.strokes.forEach(function(stroke){
				//console.log(s++);
				if (stroke.tool == "paint") {
					if (!bounds.left || stroke.bounds.left < bounds.left) {
						bounds.left = stroke.bounds.left;
					}
					if (!bounds.top || stroke.bounds.top < bounds.top) {
						bounds.top = stroke.bounds.top;
					}
					if (!bounds.right || stroke.bounds.right > bounds.right) {
						bounds.right = stroke.bounds.right;
					}
					if (!bounds.bottom || stroke.bounds.bottom > bounds.bottom) {
						bounds.bottom = stroke.bounds.bottom;
					}
				}
			});
		}
		
		return this;
	}

*/