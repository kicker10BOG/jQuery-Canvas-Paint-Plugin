// Author: Jason L. Bogle
// Date: 7/12/2016
// Last Updated: 7/12/2016
// Description: An attempt at a basic drawing app using Canvas
//		this defins tools

function BogleDrawingToolManager(owner) {
	var base = this;
	base.owner = owner;
	base.currTool;
	
	base.strokeColor = base.owner.options.strokeColor;
	base.strokeWidth = base.owner.options.strokeWidth;
	base.strokeOpacity = base.owner.options.strokeOpacity;
	//base.fillColor = base.owner.options.fillColor;
	//base.fillOpacity = base.owner.options.fillOpacity;
	
	base.setTool = function(name) {
		switch (name) {
			case "paint" : base.paint.select();
		}
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
			// stroke color
			var strokeColorDiv = $("<div>").addClass("bogleDrawingToolOptionDiv").css("order", 0);
			base.owner.innerToolDiv.append(strokeColorDiv
				.append($("<label>").html("Stroke Color: ")));
			pBase.strokeColor = $("<input>").attr({
				type: "color",
				value: base.strokeColor
			}).addClass("bogleDrawingStrokeOption").on("input change", pBase.brushAdjusted);
			strokeColorDiv.append(pBase.strokeColor);
			// end stroke color selector
			// range inputs
			var brushRanges = $("<div>").css("Order", 1).addClass("bogleDrawingToolOptionDiv");
			base.owner.innerToolDiv.append(brushRanges);
				// stroke width
				brushRanges.append($("<label>").html("Stroke Width: "));
				pBase.strokeWidthSpan = $("<span>");
				brushRanges.append(pBase.strokeWidthSpan).append("<br>");
				pBase.strokeWidth = $("<input>").attr({
					type: "range",
					max: 150,
					min: 0,
					value: base.strokeWidth
				}).addClass("bogleDrawingSlider");
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
					value: base.strokeOpacity
				}).addClass("bogleDrawingSlider");
				brushRanges.append(pBase.strokeOpacity);
				pBase.strokeOpacity.on("input change", pBase.brushAdjusted);
				// end stroke opacity slider
			// end brush ranges
			// brush preview
			pBase.brushToolPreview = $("<canvas>").attr({
				height: 150,
				width: 150
			}).addClass("bogleDrawingBrushPreview");
			base.owner.innerToolDiv.append($("<div>").addClass("bogleDrawingToolOptionDiv bogleDrawingCenter")
											.css("order", 3).append(pBase.brushToolPreview));
			pBase.brushAdjusted();
			// end brush preview
			
			base.owner.paintButton.addClass("bogleDrawingImgButtonSelected");
			base.owner.toolNameSpan.html("Paint Brush");
		},
		
		brushAdjusted : function(e) {
			//var base = e.data.base;
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
	
	// the move toggle layer visibility tool
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
				lbase.visibilityToggleButton.attr("src", "openEye.png");
				lbase.objects.forEach(function(obj) {
					obj.show();
				});
			}
			else {
				//console.log("close");
				lbase.visibilityToggleButton.attr("src", "closedEye.png");
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
				objects: data.layer.objects.slice()
			});
			data.layer.objects.forEach(function(obj) {
				obj.delCanvas();
			});
			data.layer.objects = [];
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
				objects: data.layer.objects.slice()
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
				console.log(i);
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
			console.log(lbase.opacitySlider.val());
			console.log(lbase.opacitySlider.val() / 100);
			console.log(newOpacity);
			var lastAction = lbase.actions[lbase.actions.length - 1];
			if (data.dragging) {
				if (lastAction.tool == "changeLayerOpacity" && lastAction.dragging) {
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
	
	base.currTool = base.paint;
}