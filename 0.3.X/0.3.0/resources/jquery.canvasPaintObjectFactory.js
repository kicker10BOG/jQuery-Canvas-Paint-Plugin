// Author: Jason L. Bogle
// Date: 7/14/2016
// Last Updated: 7/26/2016
// Version: 0.3.0
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
		this.bounds = {points:{}};
		this.bounds.points.left = data.mX - this.strokes[0].strokeWidth / 2;
		this.bounds.points.top = data.mY - this.strokes[0].strokeWidth / 2;
		this.bounds.points.right = data.mX + this.strokes[0].strokeWidth / 2;
		this.bounds.points.bottom = data.mY + this.strokes[0].strokeWidth / 2;
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
		
		this.drawOnContextAsImg = function(ctx) {
			this.draw();
			ctx.drawImage(this.bigCanvas[0], 0, 0);
		}
		
		this.show = function() {
			this.bigCanvas.show();
		}
		
		this.hide = function() {
			this.bigCanvas.hide();
		}
		
		this.setOrder = function(newOrder) {
			this.order = newOrder;
			this.bigCanvas.css("z-index", this.layer.order * 1000 + newOrder);
		}
		
		this.setLayerOrder = function() {
			//console.log(this);
			this.setOrder(this.order);
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
		
		this.drawPointsBoundingBox = function() {
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
		
		return this;
	}
}