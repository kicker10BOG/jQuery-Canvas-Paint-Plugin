// Author: Jason L. Bogle
// Date: 6/1/2016
// Last Updated: 7/29/2016
// Version: 0.5.0
// Description: An attempt at a basic drawing app using Canvas
//		this defines the jQuery plugin

//console.log("jquery.canvasPaint.js");

;(function($, window, document) {
	//console.log("inside");
	if (!$.boglePlugin) {
		$.boglePlugin = {};
	};
	
	var cssLink = $("<link>");
	$("head").append(cssLink);
	cssLink.attr({
		rel: "stylesheet",
		type: "text/css",
		href: "resources/canvasPaint.css"
	});
	
	$.boglePlugin.drawing = function(el, functionParam, options) {
		var base = this;
		base.$el = $(el);
		base.el = el;
		base.$el.data("boglePlugin.drawing", base);
		
		base.init = function() {
			base.functionParam = functionParam;
			base.options = $.extend({},
				$.boglePlugin.drawing.defaultOptions, options);
			
			
			base.mousePosition = {};
			base.AM = new CanvasPaintActionManager(base);
			base.TM = new CanvasPaintToolManager(base);
			base.OF = new CanvasPaintObjectFactory(base);
			base.LM = new CanvasPaintLayerManager(base);
			//console.log(base);
			
			// generate html
			// main container section
			var mainSect = $("<section>").addClass("canvasPaintMain");
			base.$el.append(mainSect);
				// top section
				base.topSect = $("<section>").addClass("canvasPaintTopSect");
				mainSect.append(base.topSect);
				// end top section
				// middle section
				var middleSect = $("<section>").addClass("canvasPaintMiddleSect");
				mainSect.append(middleSect);
					// layers outer div
					var layersOuterDiv = $("<div>").addClass("canvasPaintLayersOuterDiv").css("order", 0);
					middleSect.append(layersOuterDiv);
						// layers heading
						layersOuterDiv.append($("<strong>").html("Layers "));
						// add new layer button
						base.addNewLayerButton = $("<img>").attr({
							src: "resources/add.png",
							alt: "Add New Layer",
							title: "Add New Layer"
						}).addClass("canvasPaintImgButton");
						layersOuterDiv.append(base.addNewLayerButton);
						base.addNewLayerButton.click(base.addNewLayer)
						// end add new layer button
						// layers scrolling div
						var layersScrollingDiv = $("<div>").addClass("canvasPaintLayersScrollingDiv");
						layersOuterDiv.append(layersScrollingDiv);
							// layers inner div
							base.layersInnerDiv = $("<div>").addClass("canvasPaintLayersInnerDiv");
							layersScrollingDiv.append(base.layersInnerDiv);
							// end layers inner div
						// end layers scrolling div
					// end layers outer div
					// canvas div
					base.canvasDiv = $("<div>").addClass("canvasPaintMainCanvasDiv").css("order", 1);
					base.canvasScrollingDiv = $("<div>").addClass("canvasPaintMainCanvasScrollingDiv");
					base.canvasInnerDiv = $("<div>").addClass("canvasPaintMainCanvasInnerDiv");
					base.canvasDiv.append(base.canvasScrollingDiv.append(base.canvasInnerDiv));
					middleSect.append(base.canvasDiv);
						// main canvas
						base.mainCanvas = $("<canvas>").attr({
							height: base.options.canvHeight,
							width: base.options.canvWidth
						}).addClass("canvasPaintMainCanvas");
						base.canvasInnerDiv.append(base.mainCanvas);
						base.mainContext = base.mainCanvas[0].getContext("2d");
							// mouse and touch events
							base.mainCanvas.on("mousedown mousemove touchstart touchmove", base.canvasMouseDownMove);
							base.mainCanvas.on("mouseup mouseleave touchend", base.canvasMouseUpLeave);
							base.mainCanvas.on("contextmenu", base.canvasContextMenu);
							// end mouse and touch
						// end main canvas
					// end canvas div
					// tool settings div
						base.outerToolDiv = $("<div>").addClass("canvasPaintToolsOuterDiv").css("order", 2);
						middleSect.append(base.outerToolDiv);
					// end tool settings div
				// end middle section
				// bottom section
					// future plans
				// end bottom section
				
				base.LM.blankData = base.mainCanvas[0].toDataURL();
				
				$("body").keydown(base.keyDown);
				base.addNewLayer();
				base.TM.setUpTools();
				// remove first action from history
				base.AM.history.pop(); 
				base.LM.layers[0].actions.pop();
				console.log("Canvas Paint: Ready to draw!");
		};
		
		base.addNewLayer = function() {
			base.LM.addNewLayer();
		};
		
		base.undo = function(e) {
			base.AM.undo();
			//console.log(base.LM.layers);
		};
		
		base.redo = function(e) {
			base.AM.redo();
			//console.log(base.LM.layers);
		};
	
		base.getMousePosition = function(e) {
			//console.log(e);
			if (e.type == "mouseleave") {
				base.mousePosition.offCanvas = true;
				return;
			}
			base.mousePosition.offCanvas = false;
			var canvRect = base.mainCanvas[0].getBoundingClientRect();
			if(e.type == "touchstart" || e.type == "touchmove") {
				//console.log("touch");
				base.mousePosition.x = e.originalEvent.changedTouches[0].clientX - canvRect.left;
				base.mousePosition.y = e.originalEvent.changedTouches[0].clientY - canvRect.top;
				/*
				if (e.type == "touchstart") {
					console.log(e);
					console.log(canvRect);
					console.log("e.originalEvent.changedTouches[0].clientX: " + e.originalEvent.changedTouches[0].clientX);
					console.log("e.originalEvent.changedTouches[0].clientY: " + e.originalEvent.changedTouches[0].clientY);
					console.log("document.body.clientWidth: " + document.body.clientWidth);
					console.log("window.innerWidth: " + window.innerWidth);
					console.log("window.pageXOffset: " + window.pageXOffset);
					console.log("window.pageYOffset: " + window.pageYOffset);
					console.log(mousePosition);
				} // */
			}
			else {
				base.mousePosition.x = e.clientX - canvRect.left;// + leftScroll;
				base.mousePosition.y = e.clientY - canvRect.top;// + topScroll;
				/*
				if (e.type == "mousedown") {
					console.log(e);
					console.log(canvRect);
					console.log("e.originalEvent.layerX: " + e.originalEvent.layerX);
					console.log("e.originalEvent.layerY: " + e.originalEvent.layerY);
					console.log("e.clientX: " + e.clientX);
					console.log("e.clientY: " + e.clientY);
					console.log("document.body.clientWidth: " + document.body.clientWidth);
					console.log("window.innerWidth: " + window.innerWidth);
					console.log("window.pageXOffset: " + window.pageXOffset);
					console.log("window.pageYOffset: " + window.pageYOffset);
					console.log(mousePosition);
				} // */
			}
		}
		
		base.canvasMouseDownMove = function(e) {
			//console.log("canvasMouseDown");
			//console.log(e.which);
			e.preventDefault();
			//console.log(e);
			base.getMousePosition(e);
			if (e.which > 1) {
				return;
			}
			var dragging;
			if (e.type == "mousedown" || e.type == "touchstart") {
				dragging = false;
				base.LM.currLayer.canvasPaint = true;
			}
			else if (e.type == "mousemove" || e.type == "touchmove") {
				dragging = true;
			}
			//*
			var data = {
				layer: base.LM.currLayer,
				mX: base.mousePosition.x,
				mY: base.mousePosition.y,
				dragging: dragging
			}; //*/
			//console.log(data);
			if (base.LM.currLayer.canvasPaint) {
				base.TM.currTool.doAction(data);
			}
			base.redrawBrush();
			//*/
		};
		
		base.canvasMouseUpLeave = function(e) {
			//console.log(e);
			if (base.LM.currLayer.canvasPaint && e.which <= 1) {
				//AM.mouseUp(currLayer);
				base.LM.currLayer.canvasPaint = false;
			}
			//base.currLayer.redraw();
			base.getMousePosition(e);
			base.redrawBrush();
		}
		
		this.canvasContextMenu = function(e) {
			e.preventDefault();
		}
		
		base.drawBrush = function() {
			if (base.mousePosition.offCanvas) {
				return;
			}
			base.TM.currTool.drawTool();
		}
		
		base.redrawBrush = function() {
			//console.log(base);
			//console.log(base.mainContext.clearRect);
			base.mainContext.clearRect(0, 0, base.mainContext.canvas.width, base.mainContext.canvas.height);
			base.drawBrush();
		}
		
		base.init();
	};
	
	$.boglePlugin.drawing.defaultOptions = {
		canvWidth: 700,
		canvHeight: 394,
		currTool: "paint",
		strokeColor: "#ff0000",
		strokeWidth: 20,
		strokeOpacity: 100,
		fillColor: "#ff0000",
		fillOpacity: 100,
		outlineColor: "#000000",
		outlineWidth: 2,
		outlineOpacity: 100
	};
	
	$.fn.boglePlugin_drawing = function(functionParam, options) {
		return this.each(function() {
			//console.log("found .canvasPaint element");
			//console.log(this);
			(new $.boglePlugin.drawing(this, functionParam, options));
		});
	};
	
	$(window).ready(function() {
		$(".canvasPaint").boglePlugin_drawing();
			//console.log("found .canvasPaint element?");
	})
})(jQuery);
