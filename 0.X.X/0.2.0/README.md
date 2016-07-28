# jQuery Canvas Paint Plugin

### Version 0.2.0

A jQuery plugin that allows the user to add a basic paint application to any 
webpage. 

[JasonLBogle.com](http://jasonlbogle.com)

[Demo](http://drawing.jasonlbogle.com/)

It supports mouse and touch input. 
Functionality is still very basic, but will grow. 

---

## Task List

- [x] Eraser Tool
  * Added in version 0.2.0
- [] Square Tool
- [] Circle Tool
- [] Straight Line Tool
- [] Bezier Curve Tool
- [] Object Edit Tool (Move, Resize, Rotate, Change Color, Change Opacity)
- [] Import Image
- [] SVG Import
- [] SVG Export

---

## Dependencies

I have been testing on jQuery 3.1.0, so I recommend using that version. 

This plugin has three dependencies other than jQuery, all of which are related. Together, they 
enable the plugin's "export" functionality.

1. FileSaver.js - https://github.com/eligrey/FileSaver.js 
2. canvas-toBlob.js - https://github.com/eligrey/canvas-toBlob.js 
3. Blob. js - https://github.com/eligrey/Blob.js 

---

## LICENSE

This plugin is being made available under the MIT License as found in the 
repository.

If you use it in your own project, please let me know. While you are not 
required to letr me know you are using it, I think it would be cool to see what 
others are using it for. 

---

This project was originally influenced by the tutorial listed below, but has 
since surpassed that tutorial in many ways:
http://www.williammalone.com/articles/create-html5-canvas-javascript-drawing-app/

---

---

# Changelog

## Version 0.2.0

### Added Functionality

* Eraser Tool
  * Applied only to the current layer
  * Does not affect objects drawn on the layer after erasing
  * Changing "Stroke Opacity" changes the effect of the eraser
  * known Issue: It lags when erasing on a layer with several objects (paint strokes) (Will work on fixing this)
  
### Minor Fixes

* Toggle Icon - incorrect links were used when it was clicked

---

## Version 0.1.0

### Added Functionality

* Paint Tool - Draw with any color, different sized brushes, and varying 
opacities. 
* History - Undo / Redo (Hotkeys are Ctrl+z and Ctrl+y).
* Layers!
  * Layer Opacity - modify the opacity of an entire layer
  * Move layers up or down
  * Toggle the visibility of a layer
  * Clear a layer of all of its objects
* Export - Save the drawing to your device as a PNG.
* Touch Input - Works with mouse and touch input.

---

