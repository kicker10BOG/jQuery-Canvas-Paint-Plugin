// Author: Jason L. Bogle
// Date: 7/12/2016
// Last Updated: 7/29/2016
// Version: 0.5.0
// Description: An attempt at a basic drawing app using Canvas
//		this defines actions and action history

// The Action Manager
function CanvasPaintActionManager (owner) {
	this.owner = owner;
	this.history = new Array();
	this.future = new Array();
	this.historyLimit = 100;
	
	this.addToHistory = function(action) {
		this.history.push(action);
		//console.log(this);
		if (this.future.length > 0) {
			this.future.forEach(function(a) {
				a.layer.undone = [];
			});
			this.future = [];
		}
		if (this.history.length > this.historyLimit) {
			//console.log("over the limit");
			var a = this.history.shift();
			a.layer.actions.shift();
		}
	}
	
	this.undo = function() {
		//console.log(this);
		//console.log("AM undo");
		if (this.history.length > 0) {
			var theAction = this.history.pop();
			this.future.push(this.owner.TM.getTool(theAction.tool).undo(theAction));
		}
	}
	
	this.redo = function() {
		//console.log(this);
		if (this.future.length > 0) {
			var theAction = this.future.pop();
			this.history.push(this.owner.TM.getTool(theAction.tool).redo(theAction));
		}
	}
}
