// Author: Jason L. Bogle
// Date: 6/1/2016
// Last Updated: 7/29/2016
// Version: 0.5.0
// Description: An attempt at a basic drawing app using Canvas
//		this defines layers


function CanvasPaintLayerManager(owner) {
	var manager = this;
	manager.owner = owner;
	manager.layers = [];
	manager.blankData;
	
	manager.addNewLayer = function(order) {
		manager.owner.TM.addLayer.doAction({manager: manager, order: order});
		/*
		manager.layers.push(new manager.layer());
		manager.useLayer(manager.layers[manager.layers.length-1]);
		//console.log(manager.layers); // */
		return manager.currLayer;
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
		lbase.erased = [];
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
				.addClass("canvasPaintMiniLayerDiv").css("order", lbase.order)
				.click({layer: lbase}, manager.useLayerClicked);
			manager.owner.layersInnerDiv.append(lbase.miniLayerDiv)
				// display the id
				lbase.miniLayerDiv.append($("<strong>").html("Layer id: " + lbase.id));
				// add the mini toolbar
				var miniLayerToolbar = $("<div>").addClass("canvasPaintLayerToolbar");
				lbase.miniLayerDiv.append(miniLayerToolbar);
					// add visibility toggle button
					lbase.visibilityToggleButton = $("<img>").attr({
						src: "resources/openEye.png", 
						alt: "Hide Layer",
						title: "Hide Layer"
					}).addClass("canvasPaintImgButton").click(lbase.toggleShow);
					miniLayerToolbar
						.append($("<div>")
							.addClass("canvasPaintVisibilityToggleDiv").css("order", 0)
							.append(lbase.visibilityToggleButton));
					//lbase.visibilityToggleButton.click(lbase.toggleShow);
					// end visibility toggle
					// add clear button
					miniLayerToolbar
						.append($("<span>")
							.html("Clear").addClass("canvasPaintImgButton").css("order", 1).click({layer: this}, lbase.clear));
					// end clear button
					// add delete layer button
					miniLayerToolbar
						.append($("<div>")
							.addClass("canvasPaintImgButtonDiv").css("order", 2)
							.append($("<img>").attr({
								src: "resources/delete.png",
								alt: "Delete Layer",
								title: "Delete Layer"
							}).addClass("canvasPaintImgButton").click({layer: this}, lbase.deleteLayer)));
					// end delete layer button
					// add move layer up button
					miniLayerToolbar
						.append($("<div>")
							.addClass("canvasPaintImgButtonDiv").css("order", 3)
							.append($("<img>").attr({
								src: "resources/up.png",
								alt: "Move Layer Up",
								title: "Move Layer Up"
							}).addClass("canvasPaintImgButton").click({layer: this}, lbase.moveUp)));
					// end move layer up button
					// add move layer down button
					miniLayerToolbar
						.append($("<div>")
							.addClass("canvasPaintImgButtonDiv").css("order", 4)
							.append($("<img>").attr({
								src: "resources/down.png",
								alt: "Move Layer Down",
								title: "Move Layer Down"
							}).addClass("canvasPaintImgButton").click({layer: this}, lbase.moveDown)));
					// end move layer down button
					// add layer opacity slider
					lbase.opacitySpan = $("<span>").html("100").addClass("canvasPaintValueSpan");
					lbase.opacitySlider = $("<input>").attr({
						type: "range",
						min: 0,
						max: 100,
						value: 100
					}).addClass("canvasPaintLayerOpacity").on("input change", lbase.opacityChange);
					miniLayerToolbar.append($("<div>").html("Layer Opacity: ")
						.addClass("canvasPaintInputDiv").css("order", 5)
							.append(lbase.opacitySpan).append("%")
							.append(lbase.opacitySlider));
					// end layer opacity slider
				// end mini toolbar
				// add mini canvas (preview)
				lbase.previewCanvas = $("<canvas>").attr({
					height: manager.owner.mainContext.canvas.height,
					width: manager.owner.mainContext.canvas.width
				}).addClass("canvasPaintLayerPreviewCanvas");
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
			lbase.miniLayerDiv.addClass("canvasPaintLelectedLayer");
			manager.currLayer = lbase;
		}
		
		lbase.dontUse = function() {
			lbase.miniLayerDiv.removeClass("canvasPaintLelectedLayer");
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
					//console.log(obj);
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