// Author: Jason L. Bogle
// Date: 7/14/2016
// Last Updated: 7/16/2016
// Description: An attempt at a basic drawing app using Canvas
//		this defins objects

function BogleDrawingObjectFactory(owner) {
	var base = this;
	base.owner = owner;
	
	base.drawingObject = function(data, obj) {
		obj.tool = data.tool;
		obj.id = data.id;
		obj.order = data.order;
		obj.layer = data.layer;
		
		obj.genCanvas = function() {
			// add new canvas for the new object
			obj.bigCanvas = $("<canvas>").attr({
				height: obj.layer.manager.owner.options.canvHeight,
				width: obj.layer.manager.owner.options.canvWidth
			}).addClass("bogleDrawingObjectCanvas").css("z-index", obj.layer.order*1000 + obj.order);
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
		this.strokeColor = base.owner.TM.strokeColor;
		this.strokeWidth = base.owner.TM.strokeWidth;
		this.strokeOpacity = base.owner.TM.strokeOpacity || 100;
		this.points = new Array();
		this.points.push({
			x: data.mX,
			y: data.mY
		});
		this.bounds = {};
		this.bounds.top = data.mY - data.strokeWidth / 2;
		this.bounds.left = data.mX - data.strokeWidth / 2;
		this.bounds.bottom = data.mY - data.strokeWidth / 2;
		this.bounds.right = data.mX - data.strokeWidth / 2;
	
		this.addPoint = function(data) {
			this.points.push({
				x: data.mX,
				y: data.mY
			});
		}
		
		this.draw = function() {
			//console.log("draw: ");
			//console.log(this);
			this.bigContext.clearRect(0, 0, this.bigContext.canvas.width, this.bigContext.canvas.height);
			this.bigContext.strokeStyle = this.strokeColor;
			this.bigContext.globalAlpha = this.strokeOpacity * this.layer.opacity;
			this.bigContext.lineWidth = this.strokeWidth;
			this.bigContext.lineJoin = "round";
			this.bigContext.lineCap = "round";
			//this.bigContext.globalCompositeOperation = "xor";
			this.bigContext.beginPath();
			//console.log(this.bigContext);
			//console.log(this.layer.miniContext);
			for(var i=0; i < this.points.length; i++) {
				if (i == 0) {
					this.bigContext.moveTo(this.points[i].x, this.points[i].y);
					this.bigContext.lineTo(this.points[i].x + 0.001, this.points[i].y);
				}
				this.bigContext.lineTo(this.points[i].x, this.points[i].y);
			}
			this.bigContext.stroke();
			this.layer.previewContext.drawImage(this.bigCanvas[0], 0, 0);
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
		
		this.computeBounds = function() {
			this.points.forEach(function(p){
				//if (p.)
			});
		}
		return this;
	}
}