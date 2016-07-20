// Author: Jason L. Bogle
// Date: 6/1/2016
// Last Updated: 7/14/2016
// Description: An attempt at a basic drawing app using Canvas
//		this defins layers


function BogleDrawingLayerManager(owner) {
	var manager = this;
	manager.owner = owner;
	manager.layers = [];
	
	manager.addNewLayer = function() {
		manager.owner.TM.addLayer.doAction({manager: manager});
		/*
		manager.layers.push(new manager.layer());
		manager.useLayer(manager.layers[manager.layers.length-1]);
		//console.log(manager.layers); // */
	}
	
	manager.useLayer = function(layer) {
		if (manager.currLayer) {
			manager.currLayer.dontUse();
		}
		if (Number.isInteger(layer)) {
			manager.getLayer(layer).use();
		}
		else {
			layer.use();
		}
	}
	
	manager.useLayerClicked = function(e) {
		manager.useLayer(e.data.layer);
	}
	
	manager.getLayer = function(layerId) {
		manager.layers.forEach(function(l) {
			if (layerId == l.id) {
				return l;
			}
		});
	}
	
	manager.layer = function() {
		//console.log(base);
		var lbase = this;
		lbase.manager = manager;
		lbase.id = 0;
		lbase.order = 0;
		lbase.opacity = 1;
		manager.layers.forEach(function(l){
			lbase.id = Math.max(lbase.id, l.id);
			lbase.order = Math.max(lbase.order, l.order);
		});
		if (manager.layers.length ) {
			lbase.id += 1;
			lbase.order += 1;
		}
		//console.log(lbase);
		lbase.show = true; 
		lbase.canvasPaint = false;
		lbase.currObj = undefined;
		
		lbase.genHTML = function() {
			// add div for object canvases
			//lbase.objCanvasDiv = $("<div>").addClass("bogleDrawinbgObjCanvasDiv").css("z-index", lbase.order);
			//manager.owner.canvasDiv.append(lbase.objCanvasDiv);
			// end div for object canvases
			// add layer div
			lbase.miniLayerDiv = $("<div>")
				.addClass("bogleDrawingMiniLayerDiv").css("order", lbase.order)
				.click({layer: lbase}, manager.useLayerClicked);
			manager.owner.layersInnerDiv.append(lbase.miniLayerDiv)
				// display the id
				lbase.miniLayerDiv.append($("<strong>").html("Layer id: " + lbase.id));
				// add the mini toolbar
				var miniLayerToolbar = $("<div>").addClass("bogleDrawingLayerToolbar");
				lbase.miniLayerDiv.append(miniLayerToolbar);
					// add visibility toggle button
					lbase.visibilityToggleButton = $("<img>").attr({src: "openEye.png"})
								.addClass("bogleDrawingImgButton").click(lbase.toggleShow);
					miniLayerToolbar
						.append($("<div>")
							.addClass("bogleDrawingVisibilityToggleDiv").css("order", 0)
							.append(lbase.visibilityToggleButton));
					//lbase.visibilityToggleButton.click(lbase.toggleShow);
					// end visibility toggle
					// add clear button
					miniLayerToolbar
						.append($("<span>")
							.html("Clear").addClass("bogleDrawingImgButton").css("order", 1).click({layer: this}, lbase.clear));
					// end clear button
					// add delete layer button
					miniLayerToolbar
						.append($("<div>")
							.addClass("bogleDrawingImgButtonDiv").css("order", 2)
							.append($("<img>").attr({src: "delete.png"})
								.addClass("bogleDrawingImgButton").click({layer: this}, lbase.deleteLayer)));
					// end delete layer button
					// add move layer up button
					miniLayerToolbar
						.append($("<div>")
							.addClass("bogleDrawingImgButtonDiv").css("order", 3)
							.append($("<img>").attr({src: "up.png"})
								.addClass("bogleDrawingImgButton").click({layer: this}, lbase.moveUp)));
					// end move layer up button
					// add move layer down button
					miniLayerToolbar
						.append($("<div>")
							.addClass("bogleDrawingImgButtonDiv").css("order", 4)
							.append($("<img>").attr({src: "down.png"})
								.addClass("bogleDrawingImgButton").click({layer: this}, lbase.moveDown)));
					// end move layer down button
					// add layer opacity slider
					lbase.opacitySpan = $("<span>").html("100").addClass("bogleDrawingValueSpan");
					lbase.opacitySlider = $("<input>").attr({
						type: "range",
						min: 0,
						max: 100,
						value: 100
					}).addClass("bogleDrawingLayerOpacity").on("input change", lbase.opacityChange);
					miniLayerToolbar.append($("<div>").html("Layer Opacity: ")
						.addClass("bogleDrawingInputDiv").css("order", 5)
							.append(lbase.opacitySpan).append("%")
							.append(lbase.opacitySlider));
					// end layer opacity slider
				// end mini toolbar
				// add mini canvas (preview)
				lbase.previewCanvas = $("<canvas>").attr({
					height: manager.owner.mainContext.canvas.height,
					width: manager.owner.mainContext.canvas.width
				}).addClass("bogleDrawingLayerPreviewCanvas");
				lbase.miniLayerDiv.append(lbase.previewCanvas);
				lbase.previewContext = lbase.previewCanvas[0].getContext("2d");
				// end mini canvas (preview)
			// end layer div
			
			//console.log(this);
		}
		
		lbase.actions = [];
		lbase.undone = [];
		lbase.objects = [];
		
		lbase.use = function() {
			lbase.miniLayerDiv.addClass("bogleDrawingLelectedLayer");
			manager.currLayer = lbase;
		}
		
		lbase.dontUse = function() {
			lbase.miniLayerDiv.removeClass("bogleDrawingLelectedLayer");
		}
		
		lbase.clear = function(e) {
			manager.owner.TM.clear.doAction({layer: lbase});
		}
		
		lbase.deleteLayer = function(e) {
			manager.owner.TM.deleteLayer.doAction({layer: lbase});
		}
		
		lbase.moveUp = function(e) {
			manager.owner.TM.moveLayerUp.doAction({layer: lbase});
		}
		
		lbase.moveDown = function(e) {
			manager.owner.TM.moveLayerDown.doAction({layer: lbase});
		}
		
		lbase.opacityChange = function(e) {
			//console.log(e);
			var dragging = true;
			if (e.type == "change") {
				dragging = false;
			}
			manager.owner.TM.changeLayerOpacity.doAction({layer: lbase, dragging: dragging});
		}
		
		lbase.getObj = function(objId) {
			var i;
			for (i = 0; i < lbase.objects.length; i++) {
				if (lbase.objects[i].id == objId) {
					return lbase.objects[i];
				} 
			}
		}
		
		lbase.redraw = function() {
			//console.log("redraw: " + lbase.id);
			lbase.previewContext.clearRect(0, 0, lbase.previewContext.canvas.width, lbase.previewContext.canvas.height);
			if (lbase.show) {
				//console.log("show");
				lbase.objects.forEach(function(obj){
					obj.draw();
				});
			}
		}
		
		lbase.drawOnGlobal = function() {
			//console.log("redraw: " + lbase.id);
			if (!lbase.show) {
				return;
			}
			lbase.objects.forEach(function(obj) {
				obj.drawOnContextAsImg(manager.owner.mainContext);
			});
		}
		
		lbase.setOrder = function(newOrder) {
			lbase.order = newOrder;
			lbase.miniLayerDiv.css("order", newOrder);
			lbase.objects.forEach(function(obj) {
				obj.setLayerOrder(newOrder);
			})
		}
		
		lbase.toggleShow = function() {
			manager.owner.TM.toggleLayerVisibility.doAction({layer: lbase});
		}
		
		lbase.genHTML();
	}
}