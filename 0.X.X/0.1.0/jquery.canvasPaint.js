// Author: Jason L. Bogle
// Date: 6/1/2016
// Last Updated: 7/20/2016
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
				var topSect = $("<section>").addClass("canvasPaintTopSect");
				mainSect.append(topSect);
					// top toolbar
					var topToolbar = $("<div>").addClass("canvasPaintTopToolbar");
					topSect.append(topToolbar);
						// export tool group
						var exportToolGroup = $("<div>").addClass("canvasPaintToolGroup");
						topToolbar.append(exportToolGroup);
							// export label and name input
							exportToolGroup.append($("<label>").html("Export as:"));
							base.exportFilename = $("<input>").attr({
								type: "text",
								placeholder: "drawing"
							}).addClass("canvasPaintExportFilename");
							exportToolGroup.append(base.exportFilename);
							exportToolGroup.append(".png");
							// end export filename
							// export button
							base.exportButton = $("<span>").html("Export").addClass("canvasPaintImgButton").click(base.exportDrawing);
							exportToolGroup.append(base.exportButton);
							// end export button
						// end export tools
						// history tool group
						var historyToolGroup = $("<div>").addClass("canvasPaintToolGroup");
						topToolbar.append(historyToolGroup);
							// undo button
							base.undoButton = $("<img>").attr({
								src: "resources/undo.png"
							}).addClass("canvasPaintImgButton").click(base.undo);
							historyToolGroup.append(base.undoButton);
							historyToolGroup.append(" ");
							// end undo button
							// redo button
							base.undoButton = $("<img>").attr({
								src: "resources/redo.png"
							}).addClass("canvasPaintImgButton").click(base.redo);
							historyToolGroup.append(base.undoButton);
							// end redo button
						// end hiustory tools
						// drawing tool 
						var drawingToolsGroup = $("<div>").addClass("canvasPaintToolGroup");
							// paint brush icon button
							base.paintButton = $("<img>").attr({
								src: "resources/brush.png", 
							}).addClass("canvasPaintImgButton").click({tool:"paint"}, base.selectTool);
							topToolbar.append(drawingToolsGroup.append(base.paintButton));
							// end paint brush icon button
						// end drawing tools
					// end top toolbar
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
							src: "resources/add.png"
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
						var outerToolDiv = $("<div>").addClass("canvasPaintToolsOuterDiv").css("order", 2);
						middleSect.append(outerToolDiv);
						base.toolNameSpan = $("<span>");
						outerToolDiv.append(base.toolNameSpan).append(" settings");
						base.scrollingToolDiv = $("<div>").addClass("canvasPaintToolsScrollingDiv");
						base.innerToolDiv = $("<div>").addClass("canvasPaintToolsInnerDiv");
						outerToolDiv.append(base.scrollingToolDiv.append(base.innerToolDiv));
					// end tool settings div
				// end middle section
				// bottom section
					// future plans
				// end bottom section
				
				$("body").keydown(base.keyDown);
				base.addNewLayer();
				base.TM.setTool(base.options.currTool);
				console.log("Bogle Drawing: Ready to draw!");
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
		
		base.keyDown = function(e) {
			e = e || window.event;
			//console.log(e);
			// ctrl+z
			if ((e.keyCode == 90 || e.which == 90) && e.ctrlKey) {
				base.undo();
			}
			if ((e.keyCode == 89 || e.which == 89) && e.ctrlKey) {
				base.redo();
			}
		}
		
		base.exportDrawing = function(e) {
			base.mainContext.clearRect(0, 0, base.mainContext.canvas.width, base.mainContext.canvas.height);
			base.mainContext.globalAlpha = 1;
			base.LM.layers.forEach(function(l) {
				l.drawOnGlobal();
			});
			base.mainCanvas[0].toBlobHD(function(blob) {
				saveAs(
					  blob
					, (base.exportFilename.val() || base.exportFilename.attr("placeholder")) + ".png"
				);
			}, "image/png");
			base.mainContext.clearRect(0, 0, base.mainContext.canvas.width, base.mainContext.canvas.height);
		}
				
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
			base.TM.currTool.doAction(data);
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
		strokeOpacity: 100
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
