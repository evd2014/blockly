/**
 * Controls the UI elements for workspace factory, mostly controlling
 * the category tabs. Also includes downlaoding files because that interacts
 * directly with the DOM. Depends on FactoryController (for adding mouse
 * listeners).
 *
 * @author Emma Dauterman (edauterman)
 */

 /**
  * Class for a FactoryView
  * @constructor
  */

FactoryView = function(){
  this.tabMap = Object.create(null);
};

/**
 * Adds a category tab to the UI, and sets the tab so that when clicked, it
 * switches to that tab. Updates tabMap accordingly.
 *
 * @param {string} name The name of the category to be created
 */
FactoryView.prototype.addCategoryRow = function(name) {
  //create tab
  var table = document.getElementById('categoryTable');
  var count = table.rows.length;
  var row = table.insertRow(count);
  var nextEntry = row.insertCell(0);
  //configure tab
  nextEntry.id = "tab_" + name;
  nextEntry.textContent = name;
  //store tab
  this.tabMap[model.getId(name)] = table.rows[count].cells[0];
  //when click the tab with that name, switch to that tab
  var id = model.getId(name);
  this.bindClick(nextEntry, function(id) {return function ()
      {FactoryController.switchCategory(id)};}(id));
};

/*var getCategorySwitchFunc = function(id) {
  return function() {
    FactoryController.switchCategory(id);
  }
}*/

/**
 * Deletes a category tab from the UI and updates tabMap accordingly.
 *
 * @param {string} name Then name of the category to be deleted
 */
FactoryView.prototype.deleteCategoryRow = function(name) {
  delete this.tabMap[name];
  var table = document.getElementById('categoryTable');
  var count = table.rows.length;
  for (var i=0; i<count; i++) {
    var row = table.rows[i];
    if (row.cells[0].childNodes[0].textContent == name) {
      table.deleteRow(i);
      return;
    }
  }
};

/**
 * Switches a tab on or off.
 *
 * @param {string} name name of the tab to switch on or off
 * @param {boolean} on true if tab should be on, false if tab should be off
 UPDATE
 */
FactoryView.prototype.toggleTab = function(id, on) {
  this.tabMap[id].className = on ? 'tabon' : 'taboff';
};

/**
 * Used to bind a click to a certain DOM element (used for category tabs).
 * Taken directly from code.js
 *
 * @param {string|!Element} e1 tab element or corresponding id string
 * @param {!Function} func Function to be executed on click
 */
FactoryView.prototype.bindClick = function(el, func) {
  if (typeof el == 'string') {
    el = document.getElementById(el);
  }
  el.addEventListener('click', func, true);
  el.addEventListener('touchend', func, true);
};

/**
 * Creates a file and downloads it. In some browsers downloads, and in other
 * browsers, opens new tab with contents.
 *
 * @param {!string} contents material to be written to file
 * @param {!string} filename Name of file
 * @param {!string} fileType Type of file to be downloaded
 */
FactoryView.prototype.createAndDownloadFile = function(contents, filename,
    fileType) {
   var data = new Blob([contents], {type: 'text/' + fileType});
   var clickEvent = new MouseEvent("click", {
     "view": window,
     "bubbles": true,
     "cancelable": false
   });
   var a = document.createElement('a');
   a.href = window.URL.createObjectURL(data);
   a.download = filename;
   a.textContent = 'Download file!';
   a.dispatchEvent(clickEvent);
 };

FactoryView.prototype.updateCategoryName = function(newName, ID) {
  this.tabMap[ID].textContent = newName;
};

//if this works could update the thing where you have to cycle through all rows

FactoryView.prototype.swapCategories = function(currID, swapUp) {
  var currTab = this.tabMap[currID];
  var currName = currTab.textContent;
  var currIndex = currTab.parentNode.rowIndex;
  var table = document.getElementById('categoryTable');
  var swapIndex = currIndex + (swapUp ? - 1 : + 1); //return if out of bounds
  if ((swapIndex < 0) || (swapIndex >= table.rows.length)) {
    alert("Out of bounds"); //remove
    return;
  }

  var swapTab = table.rows[swapIndex].cells[0];
  var swapName = swapTab.textContent;

  swapTab.textContent = currName;
  currTab.textContent = swapName;
  //this.tabMap[swapID] = currTab;

 /*
  model.setSelectedId(swapID);  //swapID
  FactoryController.switchCategory(currID); //need to switch twice because needs to load it into workspace to save it -- fix??
  FactoryController.switchCategory(swapID);
  */


  this.toggleTab(currID,false);
  return {
    curr: currName,
    swap: swapName
  };


  // toolboxWorkspace.clear();
  // toolboxWorkspace.clearUndo();
  // Blockly.Xml.domToWorkspace(model.getXmlById(swapID), toolboxWorkspace);
}
