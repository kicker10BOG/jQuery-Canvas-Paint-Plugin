// Author: Jason L. Bogle
// Date: 7/12/2016
// Last Updated: 7/21/2016
// Version: 0.2.0
// Description: An attempt at a basic drawing app using Canvas
//		this defines tools

function CanvasPaintToolManager(owner) {
	var base = this;
	base.owner = owner;
	base.currTool;
	
	base.strokeColor = base.owner.options.strokeColor;
	base.strokeWidth = base.owner.options.strokeWidth;
	base.strokeOpacity = base.owner.options.strokeOpacity / 100;
	//base.fillColor = base.owner.options.fillColor;
	//base.fillOpacity = base.owner.options.fillOpacity;
	
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
	}
	
	// the paint tool
	base.paint = {
		doAction : function(data) {
			//data.tool = "paint";
			if (!data.layer.show) {
				return;
			}
			if(!data.dragging) { // new obj
				if (data.layer.objects > 0) {
					data.id = 0;
					data.layer.objects.forEach(function(obj) {
						if (obj.id >= data.id) {
							data.id = obj.id + 1;
						}
					})
				}
				else {
					data.id = 0;
				}
				data.order = data.layer.objects.length;
				data.layer.objects.push(new data.layer.manager.owner.OF.paintObject(data));
				data.layer.currObj = data.layer.objects[data.layer.objects.length - 1];
				data.layer.actions.push({
					tool: "paint",
					obj: data.layer.currObj
				});
				data.layer.redraw();
			}
			else if (data.layer.canvasPaint) { // old obj
				data.layer.currObj.addPoint(data);
				data.layer.redraw();
			}
			
			if (!data.dragging) {
				var actionData = {
					tool: "paint",
					layer: data.layer 
				}
				base.owner.AM.addToHistory(actionData);
			}
		},
		
		undo : function(data) {
			var action = data.layer.actions.pop();
			action.obj.delCanvas();
			data.layer.undone.push(action);
			data.layer.objects.pop();
			data.layer.redraw();
			return {
				tool: "paint",
				layer: data.layer
			};
		},
		
		redo : function(data) {
			var action = data.layer.undone.pop();
			//console.log(action);
			data.layer.objects.push(action.obj);
			data.layer.actions.push(action);
			action.obj.genCanvas();
			action.obj.draw()
			return {
				tool: "paint",
				layer: data.layer
			};
		},
		
		select : function(data) {
			var pBase = base.paint;
			pBase.innerToolDiv = $("<div>").addClass("canvasPaintToolsInnerDiv");
			base.scrollingToolDiv.append(pBase.innerToolDiv);
			// stroke color
			var strokeColorDiv = $("<div>").addClass("canvasPaintToolOptionDiv").css("order", 0);
			pBase.innerToolDiv.append(strokeColorDiv
				.append($("<label>").html("Stroke Color: ")));
			pBase.strokeColor = $("<input>").attr({
				type: "color",
				value: base.strokeColor
			}).addClass("canvasPaintStrokeOption").on("input change", pBase.brushAdjusted);
			strokeColorDiv.append(pBase.strokeColor);
			// end stroke color selector
			// range inputs
			var brushRanges = $("<div>").css("Order", 1).addClass("canvasPaintToolOptionDiv");
			pBase.innerToolDiv.append(brushRanges);
				// stroke width
				brushRanges.append($("<label>").html("Stroke Width: "));
				pBase.strokeWidthSpan = $("<span>");
				brushRanges.append(pBase.strokeWidthSpan).append("<br>");
				pBase.strokeWidth = $("<input>").attr({
					type: "range",
					max: 150,
					min: 0,
					value: base.strokeWidth
				}).addClass("canvasPaintSlider");
				brushRanges.append(pBase.strokeWidth);
				pBase.strokeWidth.on("input change", pBase.brushAdjusted);
				brushRanges.append("<br>")
				// end stroke width slider
				// stroke opacity
				brushRanges.append($("<label>").html("Stroke Opacity: "));
				pBase.strokeOpacitySpan = $("<span>");
				brushRanges.append(pBase.strokeOpacitySpan).append("%<br>");
				pBase.strokeOpacity = $("<input>").attr({
					type: "range",
					max: 100,
					min: 0,
					value: base.strokeOpacity * 100
				}).addClass("canvasPaintSlider");
				brushRanges.append(pBase.strokeOpacity);
				pBase.strokeOpacity.on("input change", pBase.brushAdjusted);
				// end stroke opacity slider
			// end brush ranges
			// brush preview
			pBase.brushToolPreview = $("<canvas>").attr({
				height: 150,
				width: 150
			}).addClass("canvasPaintBrushPreview");
			pBase.innerToolDiv.append($("<div>").addClass("canvasPaintToolOptionDiv canvasPaintCenter")
											.css("order", 3).append(pBase.brushToolPreview));
			pBase.brushAdjusted();
			// end brush preview
			
			pBase.icon.addClass("canvasPaintImgButtonSelected");
			base.toolNameSpan.html("Paint Brush");
			base.currTool = pBase;
		},
		
		unselect : function() {
			var pBase = base.paint;
			pBase.icon.removeClass("canvasPaintImgButtonSelected");
			pBase.innerToolDiv.remove();
		},
		
		addIcon : function(order) {
			pBase = base.paint;
			pBase.icon = $("<img>").css("order", order).attr({
				src: "resources/brush.png", 
			}).addClass("canvasPaintImgButton").click({tool:pBase}, base.setTool);
			base.drawingToolsGroup.append(pBase.icon);
		},
		
		brushAdjusted : function(e) {
			var pBase = base.paint;
			//console.log(e);
			base.strokeColor = pBase.strokeColor.val();
			base.strokeWidth = pBase.strokeWidth.val();
			base.strokeOpacity = pBase.strokeOpacity.val() / 100;
			pBase.strokeWidthSpan.html(base.strokeWidth);
			pBase.strokeOpacitySpan.html(pBase.strokeOpacity.val());
			var ctx = pBase.brushToolPreview[0].getContext('2d');
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
			var eBase = base.eraser;
			var lbase = data.layer;
			if (!lbase.show) {
				return;
			}
			if (!data.dragging) { // new eraser path
				lbase.erased.push({
					id : lbase.erased.length,
					opacity : base.eraser.strokeOpacity.val() / 100,
					width : base.eraser.strokeWidth.val(),
					points : [{x: data.mX, y: data.mY}]
				});
				lbase.objects.forEach(function(obj) {
					if (!obj.isBlank) {
						obj.erased.push(lbase.erased[lbase.erased.length - 1]);
					}
				});
				lbase.actions.push({ tool: "eraser" });
			}
			else {
				lbase.erased[lbase.erased.length - 1].points.push({x: data.mX, y: data.mY})
			}
			
			if (!data.dragging) {
				var actionData = {
					tool: "eraser",
					layer: data.layer 
				}
				base.owner.AM.addToHistory(actionData);
			}
			lbase.redraw();
		},
		
		undo : function(data) {
			console.log("undo eraser");
			var lbase = data.layer;
			var action = lbase.actions.pop();
			lbase.objects.forEach(function(obj) {
				if (obj.erased && obj.erased[obj.erased.length - 1].id == lbase.erased[lbase.erased.length - 1].id) {
					obj.erased.pop();
					obj.isBlank = false;
				}
			});
			action.erased = lbase.erased.pop();
			lbase.undone.push(action);
			lbase.redraw();
			return data;
		},
		
		redo : function(data) {
			var lbase = data.layer;
			var action = lbase.undone.pop();
			lbase.erased.push(action.erased);
			lbase.objects.forEach(function(obj) {
				obj.erased.push(action.erased);
			});
			lbase.actions.push(action);
			lbase.redraw();
			return data;
		},
		
		select : function(data) {
			var eBase = base.eraser;
			eBase.innerToolDiv = $("<div>").addClass("canvasPaintToolsInnerDiv");
			base.scrollingToolDiv.append(eBase.innerToolDiv);
			// range inputs
			var brushRanges = $("<div>").css("Order", 1).addClass("canvasPaintToolOptionDiv");
			eBase.innerToolDiv.append(brushRanges);
				// stroke width
				brushRanges.append($("<label>").html("Stroke Width: "));
				eBase.strokeWidthSpan = $("<span>");
				brushRanges.append(eBase.strokeWidthSpan).append("<br>");
				eBase.strokeWidth = $("<input>").attr({
					type: "range",
					max: 150,
					min: 0,
					value: base.strokeWidth
				}).addClass("canvasPaintSlider");
				brushRanges.append(eBase.strokeWidth);
				eBase.strokeWidth.on("input change", eBase.brushAdjusted);
				brushRanges.append("<br>")
				// end stroke width slider
				// stroke opacity
				brushRanges.append($("<label>").html("Stroke Opacity: "));
				eBase.strokeOpacitySpan = $("<span>");
				brushRanges.append(eBase.strokeOpacitySpan).append("%<br>");
				eBase.strokeOpacity = $("<input>").attr({
					type: "range",
					max: 100,
					min: 0,
					value: base.strokeOpacity * 100
				}).addClass("canvasPaintSlider");
				brushRanges.append(eBase.strokeOpacity);
				eBase.strokeOpacity.on("input change", eBase.brushAdjusted);
				// end stroke opacity slider
			// end brush ranges
			// brush preview
			eBase.brushToolPreview = $("<canvas>").attr({
				height: 150,
				width: 150
			}).addClass("canvasPaintBrushPreview");
			eBase.innerToolDiv.append($("<div>").addClass("canvasPaintToolOptionDiv canvasPaintCenter")
											.css("order", 3).append(eBase.brushToolPreview));
			eBase.brushAdjusted();
			// end brush preview
			
			eBase.icon.addClass("canvasPaintImgButtonSelected");
			base.toolNameSpan.html("Eraser");
			base.currTool = eBase;
		},
		
		unselect : function() {
			var eBase = base.eraser;
			eBase.icon.removeClass("canvasPaintImgButtonSelected");
			eBase.innerToolDiv.remove();
		},
		
		addIcon : function(order) {
			var eBase = base.eraser;
			eBase.icon = $("<img>").css("order", order).attr({
				src: "resources/eraser.png", 
			}).addClass("canvasPaintImgButton").click({tool:eBase}, base.setTool);
			base.drawingToolsGroup.append(eBase.icon);
		},
		
		brushAdjusted : function(e) {
			var eBase = base.eraser;
			//console.log(e);
			base.strokeWidth = eBase.strokeWidth.val();
			base.strokeOpacity = eBase.strokeOpacity.val() / 100;
			eBase.strokeWidthSpan.html(base.strokeWidth);
			eBase.strokeOpacitySpan.html(eBase.strokeOpacity.val());
			var ctx = eBase.brushToolPreview[0].getContext('2d');
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
	
	// the add layer tool
	base.addLayer = {
		doAction : function(data) {
			var manager = data.manager;
			manager.layers.push(new manager.layer());
			manager.useLayer(manager.layers[manager.layers.length-1]);
			
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
			var eBase = base.export;
			// export label and name input
			base.exportToolGroup.append($("<label>").html("Export as:"));
			eBase.exportFilename = $("<input>").attr({
				type: "text",
				placeholder: "drawing"
			}).addClass("canvasPaintExportFilename");
			base.exportToolGroup.append(eBase.exportFilename);
			base.exportToolGroup.append(".png");
			// end export filename
			// export button
			eBase.exportButton = $("<span>").html("Export").addClass("canvasPaintImgButton").click(eBase.exportDrawing);
			base.exportToolGroup.append(eBase.exportButton);
			// end export button
		},
		
		exportDrawing : function(e) {
			var eBase = base.export;
			var owner = base.owner;
			owner.mainContext.clearRect(0, 0, owner.mainContext.canvas.width, owner.mainContext.canvas.height);
			owner.mainContext.globalAlpha = 1;
			owner.LM.layers.forEach(function(l) {
				l.drawOnGlobal();
			});
			owner.mainCanvas[0].toBlobHD(function(blob) {
				saveAs(
					  blob
					, (eBase.exportFilename.val() || eBase.exportFilename.attr("placeholder")) + ".png"
				);
			}, "image/png");
			owner.mainContext.clearRect(0, 0, owner.mainContext.canvas.width, owner.mainContext.canvas.height);
		}
	},
	
	base.history = {
		addIcon : function(order) {
			var hBase = base.history;
			base.historyToolGroup.append(
				$("<img>").css("order", 0).addClass("canvasPaintImgButton").attr({
					src: "resources/undo.png"
				}).click(hBase.undo)
			).append(
				$("<img>").css("order", 1).addClass("canvasPaintImgButton").attr({
					src: "resources/redo.png"
				}).click(hBase.redo)
			);
		},
		
		undo : function() {
			base.owner.AM.undo();
		},
		
		redo : function() {
			base.owner.AM.redo()
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
		
		addIcon : function() {
			
		},
		
		brushAdjusted : function(e) {
			
		},
		
		drawTool : function() {
			
		}
	};
	
 */