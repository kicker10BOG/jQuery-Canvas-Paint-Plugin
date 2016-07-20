// Author: Jason L. Bogle
// Date: 7/12/2016
// Last Updated: 7/12/2016
// Description: An attempt at a basic drawing app using Canvas
//		this defins actions and action history

// The Action Manager
function BogleDrawingActionManager (owner) {
	this.owner = owner;
	this.history = new Array();
	this.future = new Array();
	this.historyLimit = 100;
	
	this.addToHistory = function(action) {
		this.history.push(action);
		//console.log(this);
		if (this.future.length > 0) {
			this.future = [];
		}
		if (this.history.length > this.historyLimit) {
			//console.log("over the limit");
			this.history.shift();
		}
	}
	
	this.undo = function() {
		//console.log(this);
		//console.log("AM undo");
		if (this.history.length > 0) {
			var theAction = this.history.pop();
			this.future.push(this.getTool(theAction.tool).undo(theAction));
		}
	}
	
	this.redo = function() {
		//console.log(this);
		if (this.future.length > 0) {
			var theAction = this.future.pop();
			this.history.push(this.getTool(theAction.tool).redo(theAction));
		}
	} 
	
	this.getTool = function(name) {
		switch (name) {
			case "paint" : return this.owner.TM.paint;
			case "clear" : return this.owner.TM.clear;
			case "addLayer" : return this.owner.TM.addLayer;
			case "toggleLayerVisibility" : return this.owner.TM.toggleLayerVisibility;
			case "deleteLayer" : return this.owner.TM.deleteLayer;
			case "moveLayerUp" : return this.owner.TM.moveLayerUp;
			case "moveLayerDown" : return this.owner.TM.moveLayerDown;
			case "changeLayerOpacity" : return this.owner.TM.changeLayerOpacity;
		}
	}
}
