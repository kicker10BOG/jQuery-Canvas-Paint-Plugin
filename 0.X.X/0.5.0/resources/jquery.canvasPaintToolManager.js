// Author: Jason L. Bogle
// Date: 7/12/2016
// Last Updated: 7/29/2016
// Version: 0.5.0
// Description: An attempt at a basic drawing app using Canvas
//		this defines tools

function CanvasPaintToolManager(owner) {
	var base = this;
	base.owner = owner;
	base.currTool;
	
	base.strokeColor = base.owner.options.strokeColor;
	base.strokeWidth = base.owner.options.strokeWidth;
	base.strokeOpacity = base.owner.options.strokeOpacity / 100;
	base.fillColor = base.owner.options.fillColor;
	base.fillOpacity = base.owner.options.fillOpacity;
	base.outlineColor = base.owner.options.outlineColor;
	base.outlineWidth = base.owner.options.outlineWidth;
	base.outlineOpacity = base.owner.options.outlineOpacity / 100;
	
	base.setTool = function(e) {
		if (base.currTool) {
			base.currTool.unselect();
		}
		e.data.tool.select();
	}
	
	base.getTool = function(name) {
		//console.log(name);
		switch(name) {
			case "paint" : return base.paint;
			case "eraser" : return base.eraser;
			case "shape" : return base.shape;
			case "clear" : return base.clear;
			case "addLayer" : return base.addLayer;
			case "toggleLayerVisibility" : return base.toggleLayerVisibility;
			case "deleteLayer" : return base.deleteLayer;
			case "moveLayerUp" : return base.moveLayerUp;
			case "moveLayerDown" : return base.moveLayerDown;
			case "changeLayerOpacity" : return base.changeLayerOpacity;
		}
	}
	
	base.setUpTools = function() {
		base.toolNameSpan = $("<span>");
		base.owner.outerToolDiv.append(base.toolNameSpan).append(" Settings");
		base.scrollingToolDiv = $("<div>").addClass("canvasPaintToolsScrollingDiv");
		base.owner.outerToolDiv.append(base.scrollingToolDiv);
		
		base.addTopToolBar();
		
		base.addExportTools(0);
		base.addHistoryTools(1);
		base.addDrawingIcons(2);
		
		base.setTool({data : {tool : base.getTool(base.owner.options.currTool)}});
	}
	
	base.addTopToolBar = function() {
		base.topToolbar = $("<div>").addClass("canvasPaintTopToolbar");
		base.owner.topSect.append(base.topToolbar);
	}
	
	base.addExportTools = function(order) {
		base.exportToolGroup = $("<div>").addClass("canvasPaintToolGroup").css("order", order);
		base.topToolbar.append(base.exportToolGroup);
		base.export.addIcon(0);
	}
	
	base.addHistoryTools = function(order) {
		base.historyToolGroup = $("<div>").addClass("canvasPaintToolGroup").css("order", order);
		base.topToolbar.append(base.historyToolGroup);
		base.history.addIcon(0);
	}
	
	base.addDrawingIcons = function(order) {
		base.drawingToolsGroup = $("<div>").addClass("canvasPaintToolGroup").css("order", order);
		base.topToolbar.append(base.drawingToolsGroup);
		
		base.paint.addIcon(0);
		base.eraser.addIcon(1);
		base.shape.addIcon(2);
	}
	
	// the paint tool
	base.paint = {
		doAction : function(data) {
			var lbase = data.layer;
			if (!lbase.show) {
				return;
			}
			if (lbase.objects.length != 0 && !data.dragging && lbase.type && lbase.type != "paint") {
				lbase.canvasPaint = false;
				base.owner.LM.addNewLayer(lbase.order + 1);
				data.layer = base.owner.LM.currLayer;
				lbase = base.owner.LM.currLayer;
				lbase.canvasPaint = true;
			}
			data.tool = "paint";
			if (lbase.objects.length == 0) {
				data.order = 0;
				lbase.type = "paint";
				lbase.objects.push(new base.owner.OF.paintObject(data));
				lbase.currObj = lbase.objects[0];
			}
			else {
				lbase.currObj.addPoint(data);
			}
			
			lbase.redraw();
			
			//data.layer.currObj.computePointsBounds();
			//data.layer.currObj.computeVisualBounds();
			//data.layer.currObj.drawPointsBoundingBox();
			//data.layer.currObj.drawVisualBoundingBox();
			
			if (!data.dragging) {
				var actionData = {
					tool: "paint",
					layer: data.layer,
					obj: lbase.currObj,
					stroke: lbase.currObj.strokes[lbase.currObj.strokes.length - 1] 
				}
				lbase.actions.push(actionData);
				base.owner.AM.addToHistory({
					tool: "paint",
					layer: data.layer
				});
			}
		},
		
		undo : function(data) {
			var action = data.layer.actions.pop();
			//console.log(action);
			if (action.obj.strokes.length == 1) {
				action.obj.delCanvas();
				action.layer.type = undefined;
				action.layer.objects.pop();
			}
			else {
				action.obj.strokes.pop();
			}
			data.layer.undone.push(action);
			data.layer.redraw();
			return data;
		},
		
		redo : function(data) {
			var action = data.layer.undone.pop();
			//console.log(action);
			if (action.stroke == action.obj.strokes[0]) {
				action.layer.objects.push(action.obj);
				action.obj.genCanvas();
				action.layer.type = "paint";
			}
			else {
				action.obj.strokes.push(action.stroke);
			}
			data.layer.actions.push(action);
			data.layer.redraw();
			return data;
		},
		
		select : function(data) {
			var pbase = base.paint;
			pbase.innerToolDiv = $("<div>").addClass("canvasPaintToolsInnerDiv");
			base.scrollingToolDiv.append(pbase.innerToolDiv);
			// stroke color
			var strokeColorDiv = $("<div>").addClass("canvasPaintToolOptionDiv").css("order", 0);
			pbase.innerToolDiv.append(strokeColorDiv
				.append($("<label>").html("Stroke Color: ")));
			pbase.strokeColor = $("<input>").attr({
				type: "color",
				value: base.strokeColor
			}).addClass("canvasPaintStrokeOption").on("input change", pbase.brushAdjusted);
			strokeColorDiv.append(pbase.strokeColor);
			// end stroke color selector
			// range inputs
			var brushRanges = $("<div>").css("Order", 1).addClass("canvasPaintToolOptionDiv");
			pbase.innerToolDiv.append(brushRanges);
				// stroke width
				brushRanges.append($("<label>").html("Stroke Width: "));
				pbase.strokeWidthSpan = $("<span>");
				brushRanges.append(pbase.strokeWidthSpan).append("<br>");
				pbase.strokeWidth = $("<input>").attr({
					type: "range",
					max: 150,
					min: 0,
					value: base.strokeWidth
				}).addClass("canvasPaintSlider");
				brushRanges.append(pbase.strokeWidth);
				pbase.strokeWidth.on("input change", pbase.brushAdjusted);
				brushRanges.append("<br>")
				// end stroke width slider
				// stroke opacity
				brushRanges.append($("<label>").html("Stroke Opacity: "));
				pbase.strokeOpacitySpan = $("<span>");
				brushRanges.append(pbase.strokeOpacitySpan).append("%<br>");
				pbase.strokeOpacity = $("<input>").attr({
					type: "range",
					max: 100,
					min: 0,
					value: base.strokeOpacity * 100
				}).addClass("canvasPaintSlider");
				brushRanges.append(pbase.strokeOpacity);
				pbase.strokeOpacity.on("input change", pbase.brushAdjusted);
				// end stroke opacity slider
			// end brush ranges
			// brush preview
			pbase.brushToolPreview = $("<canvas>").attr({
				height: 150,
				width: 150
			}).addClass("canvasPaintBrushPreview");
			pbase.innerToolDiv.append($("<div>").addClass("canvasPaintToolOptionDiv canvasPaintCenter")
											.css("order", 3).append(pbase.brushToolPreview));
			pbase.brushAdjusted();
			// end brush preview
			
			pbase.icon.addClass("canvasPaintImgButtonSelected");
			base.toolNameSpan.html("Paint Brush");
			base.currTool = pbase;
		},
		
		unselect : function() {
			var pbase = base.paint;
			pbase.icon.removeClass("canvasPaintImgButtonSelected");
			pbase.innerToolDiv.remove();
		},
		
		addIcon : function(order) {
			pbase = base.paint;
			pbase.icon = $("<img>").css("order", order).attr({
				src: "resources/brush.png",
				alt: "Paint Brush",
				title: "Paint Brush" 
			}).addClass("canvasPaintImgButton").click({tool:pbase}, base.setTool);
			base.drawingToolsGroup.append(pbase.icon);
		},
		
		brushAdjusted : function(e) {
			var pbase = base.paint;
			//console.log(e);
			base.strokeColor = pbase.strokeColor.val();
			base.strokeWidth = pbase.strokeWidth.val();
			base.strokeOpacity = pbase.strokeOpacity.val() / 100;
			pbase.strokeWidthSpan.html(base.strokeWidth);
			pbase.strokeOpacitySpan.html(pbase.strokeOpacity.val());
			var ctx = pbase.brushToolPreview[0].getContext('2d');
			///console.log(ctx);
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			ctx.fillStyle = base.strokeColor;
			ctx.globalAlpha = base.strokeOpacity;
			ctx.beginPath();
			ctx.arc(ctx.canvas.width / 2, ctx.canvas.height / 2, base.strokeWidth / 2, 0, Math.PI * 2);
			ctx.fill();
		},
		
		drawTool : function() {
			base.owner.mainContext.fillStyle = base.strokeColor;
			base.owner.mainContext.globalAlpha = base.strokeOpacity;
			base.owner.mainContext.beginPath();
			base.owner.mainContext.arc(base.owner.mousePosition.x, base.owner.mousePosition.y, base.strokeWidth / 2, 0, Math.PI * 2);
			base.owner.mainContext.fill();
		}
	}
	
	// the eraser tool
	base.eraser = {
		doAction : function(data) {
			//console.log("erasing!!!!!!");
			//console.log(data);
			var ebase = base.eraser;
			var lbase = data.layer;
			if (!lbase.show || lbase.objects.length == 0) {
				return;
			}
			data.tool = "eraser";
			var stroke = lbase.currObj.addErasePoint(data);
			
			lbase.redraw();
			
			//data.layer.currObj.computePointsBounds();
			//data.layer.currObj.computeVisualBounds();
			//data.layer.currObj.drawPointsBoundingBox();
			//data.layer.currObj.drawVisualBoundingBox();
			
			if (!data.dragging) {
				var actionData = {
					tool: "eraser",
					layer: data.layer,
					obj: lbase.currObj,
					stroke: stroke 
				}
				lbase.actions.push(actionData);
				base.owner.AM.addToHistory({
					tool: "eraser",
					layer: data.layer
				});
			}
		},
		
		undo : function(data) {
			var action = data.layer.actions.pop();
			//console.log(action);
			action.obj.undoErase();
			action.obj.isBlank = false;
			data.layer.undone.push(action);
			data.layer.redraw();
			return data;
		},
		
		redo : function(data) {
			var action = data.layer.undone.pop();
			//console.log(action);
			action.obj.redoErase(action.stroke);
			data.layer.actions.push(action);
			data.layer.redraw();
			return data;
		},
		
		select : function(data) {
			var ebase = base.eraser;
			ebase.innerToolDiv = $("<div>").addClass("canvasPaintToolsInnerDiv");
			base.scrollingToolDiv.append(ebase.innerToolDiv);
			// range inputs
			var brushRanges = $("<div>").css("Order", 1).addClass("canvasPaintToolOptionDiv");
			ebase.innerToolDiv.append(brushRanges);
				// stroke width
				brushRanges.append($("<label>").html("Stroke Width: "));
				ebase.strokeWidthSpan = $("<span>");
				brushRanges.append(ebase.strokeWidthSpan).append("<br>");
				ebase.strokeWidth = $("<input>").attr({
					type: "range",
					max: 150,
					min: 0,
					value: base.strokeWidth
				}).addClass("canvasPaintSlider");
				brushRanges.append(ebase.strokeWidth);
				ebase.strokeWidth.on("input change", ebase.brushAdjusted);
				brushRanges.append("<br>")
				// end stroke width slider
				// stroke opacity
				brushRanges.append($("<label>").html("Stroke Opacity: "));
				ebase.strokeOpacitySpan = $("<span>");
				brushRanges.append(ebase.strokeOpacitySpan).append("%<br>");
				ebase.strokeOpacity = $("<input>").attr({
					type: "range",
					max: 100,
					min: 0,
					value: base.strokeOpacity * 100
				}).addClass("canvasPaintSlider");
				brushRanges.append(ebase.strokeOpacity);
				ebase.strokeOpacity.on("input change", ebase.brushAdjusted);
				// end stroke opacity slider
			// end brush ranges
			// brush preview
			ebase.brushToolPreview = $("<canvas>").attr({
				height: 150,
				width: 150
			}).addClass("canvasPaintBrushPreview");
			ebase.innerToolDiv.append($("<div>").addClass("canvasPaintToolOptionDiv canvasPaintCenter")
											.css("order", 3).append(ebase.brushToolPreview));
			ebase.brushAdjusted();
			// end brush preview
			
			ebase.icon.addClass("canvasPaintImgButtonSelected");
			base.toolNameSpan.html("Eraser");
			base.currTool = ebase;
		},
		
		unselect : function() {
			var ebase = base.eraser;
			ebase.icon.removeClass("canvasPaintImgButtonSelected");
			ebase.innerToolDiv.remove();
		},
		
		addIcon : function(order) {
			var ebase = base.eraser;
			ebase.icon = $("<img>").css("order", order).attr({
				src: "resources/eraser.png",
				alt: "Eraser",
				title: "Eraser" 
			}).addClass("canvasPaintImgButton").click({tool:ebase}, base.setTool);
			base.drawingToolsGroup.append(ebase.icon);
		},
		
		brushAdjusted : function(e) {
			var ebase = base.eraser;
			//console.log(e);
			base.strokeWidth = ebase.strokeWidth.val();
			base.strokeOpacity = ebase.strokeOpacity.val() / 100;
			ebase.strokeWidthSpan.html(base.strokeWidth);
			ebase.strokeOpacitySpan.html(ebase.strokeOpacity.val());
			var ctx = ebase.brushToolPreview[0].getContext('2d');
			///console.log(ctx);
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			ctx.fillStyle = "#000000";
			ctx.globalAlpha = base.strokeOpacity;
			ctx.beginPath();
			ctx.arc(ctx.canvas.width / 2, ctx.canvas.height / 2, base.strokeWidth / 2, 0, Math.PI * 2);
			ctx.fill();
		},
		
		drawTool : function() {
			base.owner.mainContext.fillStyle = "#000000";
			base.owner.mainContext.globalAlpha = base.strokeOpacity;
			base.owner.mainContext.beginPath();
			base.owner.mainContext.arc(base.owner.mousePosition.x, base.owner.mousePosition.y, base.strokeWidth / 2, 0, Math.PI * 2);
			base.owner.mainContext.fill();
		}
	};
	
	// The Shape Tool
	base.shape = {
		doAction : function(data) {
			//console.log("rectangling");
			data.tool = "shape";
			var sbase = base.shape;
			//console.log(data);
			var lbase = data.layer;
			if (!lbase.show) {
				return;
			}
			if (lbase.objects.length != 0 && !data.dragging) {
				lbase.canvasPaint = false;
				base.owner.LM.addNewLayer(lbase.order + 1);
				data.layer = base.owner.LM.currLayer;
				lbase = base.owner.LM.currLayer;
				lbase.canvasPaint = true;
			}
			if (lbase.objects.length == 0 && !data.dragging) {data.order = 0;
				lbase.type = "shape";
				lbase.objects.push(sbase.shapes.createNew(data));
				lbase.currObj = lbase.objects[0];
			}
			else if (lbase.type == "shape") {
				//console.log("dragging");
				lbase.currObj.updateShape(data);
			}
			
			lbase.redraw();
			
			if (!data.dragging) {
				var actionData = {
					tool: "shape",
					layer: data.layer,
					obj: lbase.currObj 
				}
				lbase.actions.push(actionData);
				base.owner.AM.addToHistory({
					tool: "shape",
					layer: data.layer
				});
			}
		},
		
		undo : function(data) {
			var action = data.layer.actions.pop();
			//console.log(action);
			action.obj.delCanvas();
			action.layer.type = undefined;
			action.layer.objects.pop();
			data.layer.undone.push(action);
			data.layer.redraw();
			return data;
		},
		
		redo : function(data) {
			var action = data.layer.undone.pop();
			//console.log(action);
			action.layer.objects.push(action.obj);
			action.obj.genCanvas();
			action.layer.type = "shape";
			data.layer.actions.push(action);
			data.layer.redraw();
			return data;
		},
		
		select : function(data) {
			var sbase = base.shape;
			sbase.innerToolDiv = $("<div>").addClass("canvasPaintToolsInnerDiv");
			base.scrollingToolDiv.append(sbase.innerToolDiv);
			// shape selector
			sbase.shapes = base.owner.OF.shapes;
			sbase.shapeSelectDiv = $("<div>").addClass("canvasPaintToolOptionDiv").css("order", 0);
			sbase.innerToolDiv.append(sbase.shapeSelectDiv);
			sbase.shapes.addShapeOptions(sbase.shapeSelectDiv);
			sbase.shapes.setShape({data:{shape:"rectangle"}});
			// end shape selector
			// fill color
			var fillColorDiv = $("<div>").addClass("canvasPaintToolOptionDiv").css("order", 0);
			sbase.innerToolDiv.append(fillColorDiv
				.append($("<label>").html("Fill Color: ")));
			sbase.fillColor = $("<input>").attr({
				type: "color",
				value: base.fillColor
			}).addClass("canvasPaintoutlineOption").on("input change", sbase.brushAdjusted);
			fillColorDiv.append(sbase.fillColor);
			// end fill color selector
			// range inputs
			var fillBrushRanges = $("<div>").css("Order", 1).addClass("canvasPaintToolOptionDiv");
			sbase.innerToolDiv.append(fillBrushRanges);
				// fill opacity
				fillBrushRanges.append($("<label>").html("Fill Opacity: "));
				sbase.fillOpacitySpan = $("<span>");
				fillBrushRanges.append(sbase.fillOpacitySpan).append("%<br>");
				sbase.fillOpacity = $("<input>").attr({
					type: "range",
					max: 100,
					min: 0,
					value: base.fillOpacity * 100
				}).addClass("canvasPaintSlider");
				fillBrushRanges.append(sbase.fillOpacity);
				sbase.fillOpacity.on("input change", sbase.brushAdjusted);
				// end fill opacity slider
			// end brush ranges
			// outline color
			var outlineColorDiv = $("<div>").addClass("canvasPaintToolOptionDiv").css("order", 0);
			sbase.innerToolDiv.append(outlineColorDiv
				.append($("<label>").html("outline Color: ")));
			sbase.outlineColor = $("<input>").attr({
				type: "color",
				value: base.outlineColor
			}).addClass("canvasPaintoutlineOption").on("input change", sbase.brushAdjusted);
			outlineColorDiv.append(sbase.outlineColor);
			// end outline color selector
			// range inputs
			var brushRanges = $("<div>").css("Order", 1).addClass("canvasPaintToolOptionDiv");
			sbase.innerToolDiv.append(brushRanges);
				// outline width
				brushRanges.append($("<label>").html("outline Width: "));
				sbase.outlineWidthSpan = $("<span>");
				brushRanges.append(sbase.outlineWidthSpan).append("<br>");
				sbase.outlineWidth = $("<input>").attr({
					type: "range",
					max: 25,
					min: 0,
					value: base.outlineWidth
				}).addClass("canvasPaintSlider");
				brushRanges.append(sbase.outlineWidth);
				sbase.outlineWidth.on("input change", sbase.brushAdjusted);
				brushRanges.append("<br>")
				// end outline width slider
				// outline opacity
				brushRanges.append($("<label>").html("outline Opacity: "));
				sbase.outlineOpacitySpan = $("<span>");
				brushRanges.append(sbase.outlineOpacitySpan).append("%<br>");
				sbase.outlineOpacity = $("<input>").attr({
					type: "range",
					max: 100,
					min: 0,
					value: base.outlineOpacity * 100
				}).addClass("canvasPaintSlider");
				brushRanges.append(sbase.outlineOpacity);
				sbase.outlineOpacity.on("input change", sbase.brushAdjusted);
				// end outline opacity slider
			// end brush ranges
			// brush preview
			sbase.brushToolPreview = $("<canvas>").attr({
				height: 150,
				width: 150
			}).addClass("canvasPaintBrushPreview");
			sbase.innerToolDiv.append($("<div>").addClass("canvasPaintToolOptionDiv canvasPaintCenter")
											.css("order", 3).append(sbase.brushToolPreview));
			sbase.brushAdjusted();
			// end brush preview
			
			sbase.icon.addClass("canvasPaintImgButtonSelected");
			base.toolNameSpan.html("Shape Tool");
			base.currTool = sbase;
		},
		
		unselect : function() {
			var sbase = base.shape;
			sbase.icon.removeClass("canvasPaintImgButtonSelected");
			sbase.innerToolDiv.remove();
		},
		
		addIcon : function(order) {
			var sbase = base.shape;
			sbase.icon = $("<img>").css("order", order).attr({
				src: "resources/shapes.png",
				alt: "Shapes",
				title: "Shapes" 
			}).addClass("canvasPaintImgButton").click({tool:sbase}, base.setTool);
			base.drawingToolsGroup.append(sbase.icon);
		},
		
		brushAdjusted : function() {
			var sbase = base.shape;
			//console.log(e);
			base.fillColor = sbase.fillColor.val();
			base.fillOpacity = sbase.fillOpacity.val() / 100;
			base.outlineColor = sbase.outlineColor.val();
			base.outlineWidth = parseInt(sbase.outlineWidth.val());
			base.outlineOpacity = sbase.outlineOpacity.val() / 100;
			sbase.outlineWidthSpan.html(base.outlineWidth);
			sbase.fillOpacitySpan.html(sbase.fillOpacity.val());
			sbase.outlineOpacitySpan.html(sbase.outlineOpacity.val());
			sbase.shapes.drawPreview(sbase.brushToolPreview[0].getContext('2d'), base);
		},
		
		drawTool : function() {
			var ctx = base.owner.mainContext;
			var mp = base.owner.mousePosition;
			var size = 15;
			var offset = 3;
			ctx.strokeStyle = "#000000";
			ctx.lineWidth = 2;
			ctx.globalAlpha = 1;
			// left
			ctx.beginPath();
			ctx.moveTo(mp.x - offset, mp.y);
			ctx.lineTo(mp.x - size, mp.y)
			ctx.stroke();
			// top
			ctx.beginPath();
			ctx.moveTo(mp.x, mp.y - offset);
			ctx.lineTo(mp.x, mp.y - size)
			ctx.stroke();
			// right
			ctx.beginPath();
			ctx.moveTo(mp.x + offset, mp.y);
			ctx.lineTo(mp.x + size, mp.y)
			ctx.stroke();
			// bottom
			ctx.beginPath();
			ctx.moveTo(mp.x, mp.y + offset);
			ctx.lineTo(mp.x, mp.y + size)
			ctx.stroke();
		}
	};
	
	// the add layer tool
	base.addLayer = {
		doAction : function(data) {
			var manager = data.manager;
			if (data.order) {
				manager.layers.splice(data.order, 0, new manager.layer());
				manager.useLayer(manager.layers[data.order]);
				for (var i = data.order; i < manager.layers.length; i++) {
					manager.layers[i].setOrder(i);
				}
			}
			else {
				manager.layers.push(new manager.layer());
				manager.useLayer(manager.layers[manager.layers.length-1]);
			}
			manager.currLayer.actions.push({
				tool: "addLayer",
				layer: manager.currLayer
			});
			base.owner.AM.addToHistory({
				tool: "addLayer",
				layer: manager.currLayer
			});
		}, 
		
		undo : function(data) {
			var lbase = data.layer;
			var manager = lbase.manager;
			var action = lbase.actions.pop();
			lbase.miniLayerDiv.remove();
			var found = false;
			var isCurr = (lbase.manager.currLayer.id == lbase.id);
			var i;
			for (i = 0; i < lbase.manager.layers.length; i++) {
				if (lbase.manager.layers[i].id == lbase.id) { 
					lbase.manager.layers.splice(i, 1);
					found = true;
					if (isCurr) {
						if (i != 0) {
							lbase.manager.useLayer(lbase.manager.layers[i-1]);
						}
						else if (i < lbase.manager.layers.length) {
							lbase.manager.useLayer(lbase.manager.layers[i]);
						}
						else {
							lbase.manager.currLayer = undefined;
						}
					}
				}
				if (found && i < lbase.manager.layers.length) {
					lbase.manager.layers[i].setOrder(i);
				}
			}
			
			lbase.undone.push(action);
			return data;
		}, 
		
		redo : function(data) {
			var lbase = data.layer;
			var manager = lbase.manager;
			var action = lbase.undone.pop();
			lbase.manager.layers.splice(lbase.order, 0, lbase);
			lbase.genHTML();
			for (var i = 0; i < lbase.manager.layers.length; i++) {
				lbase.manager.layers[i].setOrder(i);
			}
			if (action.wasCurr) {
				lbase.manager.useLayer(lbase);
			}
			manager.useLayer(lbase);
			lbase.redraw();
			lbase.actions.push(action);
			return data;
		}
	}
	
	// the toggle layer visibility tool
	base.toggleLayerVisibility = {
		doAction : function(data) {
			lbase = data.layer;
			this.action(lbase);
					
			lbase.actions.push({
				tool: "toggleLayerVisibility",
				layer: lbase
			});
			base.owner.AM.addToHistory({
				tool: "toggleLayerVisibility",
				layer: lbase
			});
			return;
		},
		
		undo : function(data) {
			lbase = data.layer;
			this.action(lbase);
			lbase.undone.push(lbase.actions.pop());
			return data;
		},
		
		redo : function(data) {
			lbase = data.layer;
			this.action(lbase);
			lbase.actions.push(lbase.undone.pop());
			return data;
		},
		
		action : function(lbase) {
			lbase.show = !lbase.show;
			if (lbase.show) {
				//console.log("open");
				lbase.visibilityToggleButton.attr("src", "resources/openEye.png");
				lbase.objects.forEach(function(obj) {
					obj.show();
				});
			}
			else {
				//console.log("close");
				lbase.visibilityToggleButton.attr("src", "resources/closedEye.png");
				lbase.objects.forEach(function(obj) {
					obj.hide();
				});
			}
		}
	}
	
	// the clear tool
	base.clear = {
		doAction : function(data) {
			//console.log(data);
			data.layer.actions.push({
				tool: "clear",
				objects: data.layer.objects.slice(),
				erased: data.layer.erased.slice()
			});
			data.layer.objects.forEach(function(obj) {
				obj.delCanvas();
			});
			data.layer.objects = [];
			data.layer.erased = [];
			//console.log(data.layer.objects);
			//console.log(data.layer.actions[data.layer.actions.length - 1]);
			base.owner.AM.addToHistory({
				tool: "clear",
				layer: data.layer
			});
			
			data.layer.redraw(); 
		},
		
		undo : function(data) {
			var action = data.layer.actions.pop();
			data.layer.objects = action.objects;
			data.layer.erased = action.erased;
			data.layer.objects.forEach(function(obj) {
				obj.genCanvas();
			});
			data.layer.undone.push({tool: "clear"});
			data.layer.redraw();
			return {
				tool: "clear",
				layer: data.layer
			};
		},
		
		redo : function(data) {
			var action = data.layer.undone.pop();
			data.layer.actions.push({
				tool: "clear",
				objects: data.layer.objects.slice(),
				erased: data.layer.erased.slice()
			});
			data.layer.objects.forEach(function(obj) {
				obj.delCanvas();
			});
			data.layer.objects = [];
			data.layer.redraw();
			return{
				tool: "clear",
				layer: data.layer
			}; 
		}
	}
	
	// the delete a layer tool
	base.deleteLayer = {
		doAction : function(data) {
			//console.log(data);
			data.layer.miniLayerDiv.remove();
			var found = false;
			var isCurr = (data.layer.manager.currLayer.id == data.layer.id);
			for (var i = 0; i < data.layer.manager.layers.length; i++) {
				if (data.layer.manager.layers[i].id == data.layer.id) { 
					data.layer.manager.layers.splice(i, 1);
					found = true;
					if (isCurr) {
						if (i != 0) {
							data.layer.manager.useLayer(data.layer.manager.layers[i-1]);
						}
						else if (i < data.layer.manager.layers.length) {
							data.layer.manager.useLayer(data.layer.manager.layers[i]);
						}
						else {
							data.layer.manager.currLayer = undefined;
						}
					}
				}
				if (found && i < data.layer.manager.layers.length) {
					data.layer.manager.layers[i].setOrder(i);
				}
			}
			data.layer.objects.forEach(function(obj) {
				obj.delCanvas();
			});
			
			data.layer.actions.push({
				tool: "deleteLayer",
				layer: data.layer,
				wasCurr: isCurr
			});
			base.owner.AM.addToHistory({
				tool: "deleteLayer",
				layer: data.layer
			});
		},
		
		undo : function(data) {
			var action = data.layer.actions.pop();
			//console.log(action);
			action.layer.manager.layers.splice(action.layer.order, 0, action.layer);
			action.layer.genHTML();
			action.layer.objects.forEach(function(obj) {
				obj.genCanvas();
			});
			action.layer.undone.push(action);
			for (var i = 0; i < action.layer.manager.layers.length; i++) {
				//console.log(i);
				action.layer.manager.layers[i].setOrder(i);
			}
			if (action.wasCurr) {
				action.layer.manager.useLayer(action.layer);
			}
			action.layer.redraw();
			return data;
		},
		
		redo : function(data) {
			var action = data.layer.undone.pop();
			action.layer.miniLayerDiv.remove();
			var found = false;
			var isCurr = (action.layer.manager.currLayer.id == action.layer.id);
			var i;
			for (i = 0; i < action.layer.manager.layers.length; i++) {
				if (action.layer.manager.layers[i].id == action.layer.id) { 
					action.layer.manager.layers.splice(i, 1);
					found = true;
					if (isCurr) {
						if (i != 0) {
							action.layer.manager.useLayer(action.layer.manager.layers[i-1]);
						}
						else if (i < action.layer.manager.layers.length) {
							action.layer.manager.useLayer(action.layer.manager.layers[i]);
						}
						else {
							action.layer.manager.currLayer = undefined;
						}
					}
				}
				if (found && i < action.layer.manager.layers.length) {
					action.layer.manager.layers[i].setOrder(i);
				}
			}
			action.layer.objects.forEach(function(obj) {
				obj.delCanvas();
			});
			action.layer.actions.push(action);
			return data;
		}
	}
	
	// the move layer up tool
	base.moveLayerUp = {
		doAction : function(data) {
			var lbase = data.layer;
			var manager = lbase.manager;
			for (var i = 0; i < manager.layers.length; i++) {
				if (manager.layers[i].id == lbase.id && i < manager.layers.length - 1) {
					manager.layers[i] = manager.layers[i + 1];
					manager.layers[i + 1] = lbase;
					lbase.setOrder(i + 1);
					manager.layers[i].setOrder(i);
					
					lbase.actions.push({
						tool: "moveLayerUp",
						layer: lbase
					});
					base.owner.AM.addToHistory({
						tool: "moveLayerUp",
						layer: lbase
					});
					return;
				}
			}
		}, 
		
		undo : function(data) {
			var lbase = data.layer;
			var manager = lbase.manager;
			var action = lbase.actions.pop();
			for (var i = 0; i < manager.layers.length; i++) {
				if (manager.layers[i].id == lbase.id && i > 0) {
					manager.layers[i] = manager.layers[i - 1];
					manager.layers[i - 1] = lbase;
					lbase.setOrder(i - 1);
					manager.layers[i].setOrder(i);
					
					lbase.undone.push(action);
					return data;
				}
			}
		}, 
		
		redo : function(data) {
			var lbase = data.layer;
			var manager = lbase.manager;
			var action = lbase.undone.pop();
			for (var i = 0; i < manager.layers.length; i++) {
				if (manager.layers[i].id == lbase.id && i < manager.layers.length - 1) {
					manager.layers[i] = manager.layers[i + 1];
					manager.layers[i + 1] = lbase;
					lbase.setOrder(i + 1);
					manager.layers[i].setOrder(i);
			
					lbase.actions.push(action);
					return data;
				}
			}
		}
	}
	
	// the move layer down tool
	base.moveLayerDown = {
		doAction : function(data) {
			var lbase = data.layer;
			var manager = lbase.manager;
			for (var i = 0; i < manager.layers.length; i++) {
				if (manager.layers[i].id == lbase.id && i > 0) {
					manager.layers[i] = manager.layers[i - 1];
					manager.layers[i - 1] = lbase;
					lbase.setOrder(i - 1);
					manager.layers[i].setOrder(i);
			
					lbase.actions.push({
						tool: "moveLayerDown",
						layer: lbase
					});
					base.owner.AM.addToHistory({
						tool: "moveLayerDown",
						layer: lbase
					});
					return;
				}
			}
		}, 
		
		undo : function(data) {
			var lbase = data.layer;
			var manager = lbase.manager;
			var action = lbase.actions.pop();
			for (var i = 0; i < manager.layers.length; i++) {
				if (manager.layers[i].id == lbase.id && i < manager.layers.length - 1) {
					manager.layers[i] = manager.layers[i + 1];
					manager.layers[i + 1] = lbase;
					lbase.setOrder(i + 1);
					manager.layers[i].setOrder(i);
					
					lbase.undone.push(action);
					return data;
				}
			}
		}, 
		
		redo : function(data) {
			var lbase = data.layer;
			var manager = lbase.manager;
			var action = lbase.undone.pop();
			for (var i = 0; i < manager.layers.length; i++) {
				if (manager.layers[i].id == lbase.id && i > 0) {
					manager.layers[i] = manager.layers[i - 1];
					manager.layers[i - 1] = lbase;
					lbase.setOrder(i - 1);
					manager.layers[i].setOrder(i);
			
					lbase.actions.push(action);
					return data;
				}
			}
		}
	}
	
	// layer opacity tool
	base.changeLayerOpacity = {
		doAction : function(data) {
			//console.log(data););
			var lbase = data.layer;
			var newOpacity = lbase.opacitySlider.val() / 100;
			var lastAction = lbase.actions[lbase.actions.length - 1];
			if (data.dragging) {
				if (lastAction && lastAction.tool == "changeLayerOpacity" && lastAction.dragging) {
					lastAction.valueTo = newOpacity;
				}
				else {
					lbase.actions.push({
						tool: "changeLayerOpacity",
						dragging: true,
						valueTo: newOpacity,
						valueFrom: lbase.opacity
					});
					base.owner.AM.addToHistory({
						tool: "changeLayerOpacity",
						layer: lbase
					});
				}
			}
			else {
				if (lastAction.tool == "changeLayerOpacity" && lastAction.dragging) {
					lastAction.valueTo = newOpacity;
					lastAction.dragging = false;
				}
				else {
					lbase.actions.push({
						tool: "changeLayerOpacity",
						dragging: false,
						valueTo: newOpacity,
						valueFrom: lbase.opacity
					});
					base.owner.AM.addToHistory({
						tool: "changeLayerOpacity",
						layer: lbase
					});
				}
			}
			lbase.objects.forEach(function(obj) {
				obj.isBlank = false;
			});
			lbase.opacity = newOpacity;
			lbase.opacitySpan.html(lbase.opacitySlider.val());
			lbase.redraw();
		},
		
		undo : function(data) {
			var lbase = data.layer;
			var action = lbase.actions.pop();
			console.log(action);
			lbase.opacity = action.valueFrom;
			lbase.opacitySpan.html(Math.round(action.valueFrom * 100));
			lbase.opacitySlider.val(action.valueFrom * 100);
			lbase.undone.push(action);
			lbase.redraw();
			return data;
		},
		
		redo : function(data) {
			var lbase = data.layer;
			var action = lbase.undone.pop();
			console.log(action);
			lbase.opacity = action.valueTo;
			lbase.opacitySpan.html(Math.round(action.valueTo * 100));
			lbase.opacitySlider.val(action.valueTo * 100);
			lbase.actions.push(action);
			lbase.redraw();
			return data;
		}
	}
	
	base.export = {
		addIcon : function(order) {
			var ebase = base.export;
			// export label and name input
			base.exportToolGroup.append($("<label>").html("Export as:"));
			ebase.exportFilename = $("<input>").attr({
				type: "text",
				placeholder: "drawing"
			}).addClass("canvasPaintExportFilename");
			base.exportToolGroup.append(ebase.exportFilename);
			base.exportToolGroup.append(".png");
			// end export filename
			// export button
			ebase.exportButton = $("<span>").html("Export").addClass("canvasPaintImgButton").click(ebase.exportDrawing);
			base.exportToolGroup.append(ebase.exportButton);
			// end export button
		},
		
		exportDrawing : function(e) {
			var ebase = base.export;
			var owner = base.owner;
			owner.mainContext.clearRect(0, 0, owner.mainContext.canvas.width, owner.mainContext.canvas.height);
			owner.mainContext.globalAlpha = 1;
			owner.LM.layers.forEach(function(l) {
				l.drawOnGlobal();
			});
			owner.mainCanvas[0].toBlobHD(function(blob) {
				saveAs(
					  blob
					, (ebase.exportFilename.val() || ebase.exportFilename.attr("placeholder")) + ".png"
				);
			}, "image/png");
			owner.mainContext.clearRect(0, 0, owner.mainContext.canvas.width, owner.mainContext.canvas.height);
		}
	},
	
	// history tools
	base.history = {
		addIcon : function(order) {
			var hbase = base.history;
			base.historyToolGroup.append(
				$("<img>").css("order", 0).addClass("canvasPaintImgButton").attr({
					src: "resources/undo.png",
					alt: "Undo",
					title: "Undo"
				}).click(hbase.undo)
			).append(
				$("<img>").css("order", 1).addClass("canvasPaintImgButton").attr({
					src: "resources/redo.png",
					alt: "Redo",
					title: "Redo"
				}).click(hbase.redo)
			);
			$("body").keydown(hbase.keyDown);
		},
		
		undo : function(e) {
			base.owner.AM.undo();
		},
		
		redo : function(e) {
			base.owner.AM.redo()
		}, 
		
		keyDown : function(e) {
			e = e || window.event;
			var hbase = base.history;
			//console.log(e);
			if ((e.which == 90 || e.keyCode == 90) && e.ctrlKey) {
				hbase.undo();
			}
			else if ((e.which == 89 || e.keyCode == 89) && e.ctrlKey) {
				hbase.redo();
			}
		}
	}
	
	//base.currTool = base.paint;
}

/* drawing tool template
	
	base.toolName = {
		doAction : function(data) {
			
		},
		
		undo : function(data) {
			
		},
		
		redo : function(data) {
			
		},
		
		select : function(data) {
			
		},
		
		unselect : function() {
			
		},
		
		addIcon : function(order) {
			
		},
		
		brushAdjusted : function(e) {
			
		},
		
		drawTool : function() {
			
		}
	};
	
 */