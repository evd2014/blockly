/**
 * Controls the UI elements for workspace factory, mainly the category tabs.
 * Also includes downlaoding files because that interacts directly with the DOM.
 * Depends on FactoryController (for adding mouse listeners). Tabs for each
 * category are stored in tab map, which associates a unique ID for a
 * category with a particular tab.
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
 * switches to that category based on the unique ID associated with that
 * tab. Updates tabMap accordingly.
 *
 * @param {string} name The name of the category to be created
 */
FactoryView.prototype.addCategoryRow = function(name) {
  // Create tab.
  var table = document.getElementById('categoryTable');
  var count = table.rows.length;
  var row = table.insertRow(count);
  var nextEntry = row.insertCell(0);
  // Configure tab.
  nextEntry.id = "tab_" + name;
  nextEntry.textContent = name;
  // Store tab.
  this.tabMap[model.getId(name)] = table.rows[count].cells[0];
  // When click the tab with that name, switch to that tab.
  var id = model.getId(name);
  this.bindClick(nextEntry, function(id) {return function ()
      {FactoryController.switchCategory(id)};}(id));
};

/**
 * Deletes a category tab from the UI and updates tabMap accordingly.
 *
 * @param {string} name Then name of the category to be deleted
 */
FactoryView.prototype.deleteCategoryRow = function(name) {
  delete this.tabMap[model.getId(name)];
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
 * @param {!string} id ID of the tab to switch on or off
 * @param {boolean} on true if tab should be on, false if tab should be off
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

/**
 * Given the ID of a certain category, updates the corresponding tab in
 * the DOM to show a new name.
 *
 * @param {!string} newName Name of string to be displayed on tab
 * @param {!string} id ID of category to be updated
 *
 */
FactoryView.prototype.updateCategoryName = function(newName, id) {
  this.tabMap[id].textContent = newName;
};

/**
 * Given the ID of the current category selected and the direction of the swap,
 * swaps the labels on two categories, turns off the current tab, and returns
 * the name of the category currently selected and the one being swapped to
 * (so that the model can access it later). Returns null if the user attempts
 * to swap a category out of bounds.
 *
 * @param {!string} currID ID of currently selected category
 * @param {boolean} swapUp true if switching with the category above, false
 * if switching with the category below
 * @return {(string, string)} curr field contains the name of the currently
 * selected category, swap contains the name of the category to be swapped
 * with. Null if there is no valid category to swap.
 */
FactoryView.prototype.swapCategories = function(currID, swapUp) {
  var currTab = this.tabMap[currID];
  var currName = currTab.textContent;
  var currIndex = currTab.parentNode.rowIndex;
  var table = document.getElementById('categoryTable');
  var swapIndex = currIndex + (swapUp ? - 1 : + 1);
  if ((swapIndex < 0) || (swapIndex >= table.rows.length)) {
    return null;  // Return null if out of bounds.
  }
  var swapTab = table.rows[swapIndex].cells[0];
  var swapName = swapTab.textContent;
  // Adjust text content of tabs.
  swapTab.textContent = currName;
  currTab.textContent = swapName;
  this.toggleTab(currID,false);
  return {
    curr: currName,
    swap: swapName
  };
}
