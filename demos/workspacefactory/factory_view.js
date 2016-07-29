/**
 * Controls the UI elements for workspace factory, mainly the category tabs.
 * Also includes downloading files because that interacts directly with the DOM.
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

FactoryView = function() {
  // Stores td DOM element of each tab for the ID of a ListElement.
  this.tabMap = Object.create(null);
};

/**
 * Adds a category tab to the UI, and updates tabMap accordingly.
 *
 * @param {!string} name The name of the category being created
 * @param {!string} id ID of category being created
 * @param {boolean} firstCategory true if it's the first category, false
 * otherwise
 * @return {!Element} DOM element created for tab
 */
FactoryView.prototype.addCategoryRow = function(name, id, firstCategory) {
  var table = document.getElementById('categoryTable');
  // Delete help label and enable category buttons if it's the first category.
  if (firstCategory) {
    table.deleteRow(0);
  }
  // Create tab.
  var count = table.rows.length;
  var row = table.insertRow(count);
  var nextEntry = row.insertCell(0);
  // Configure tab.
  nextEntry.id = this.createCategoryIdName(name);
  nextEntry.textContent = name;
  // Store tab.
  this.tabMap[id] = table.rows[count].cells[0];
  // Return tab.
  return nextEntry;
};

/**
 * Deletes a category tab from the UI and updates tabMap accordingly.
 *
 * @param {!string} id ID of category to be deleted.
 * @param {!string} name The name of the category to be deleted.
 */
FactoryView.prototype.deleteElementRow = function(id, index) {
  // Delete tab entry.
  delete this.tabMap[id];
  // Delete tab row.
  var table = document.getElementById('categoryTable');
  var count = table.rows.length;
  table.deleteRow(index);
  // If last category removed, add category help text and disable category
  // buttons.
  if (count == 1) {
    var row = table.insertRow(0);
    row.textContent = 'Your categories will appear here';
  }
};

/**
 * Given the index of the currently selected category, updates the state of
 * the buttons that allow the user to edit the categories. Updates the edit
 * name and arrow buttons. Should be called when adding or removing categories
 * or when changing to a new category or when swapping to a different category.
 *
 * TODO(evd2014): Switch to using CSS to add/remove styles.
 *
 * @param {int} selectedIndex The index of the currently selected category,
 * -1 if no categories created.
 * @param {!string} selectedType The type of the selected ListElement.
 * ListElement.TYPE_CATEGORY or ListElement.TYPE_SEPARATOR.
 */
FactoryView.prototype.updateState = function(selectedIndex, selectedType) {
  document.getElementById('button_edit').disabled = selectedIndex < 0 ||
      selectedType != ListElement.TYPE_CATEGORY;
  document.getElementById('button_remove').disabled = selectedIndex < 0;
  document.getElementById('button_up').disabled =
      selectedIndex <= 0 ? true : false;
  var table = document.getElementById('categoryTable');
  document.getElementById('button_down').disabled = selectedIndex >=
      table.rows.length - 1 || selectedIndex < 0 ? true : false;
};

/**
 * Determines the DOM id for a category given its name.
 *
 * @param {!string} name Name of category
 * @return {!string} ID of category tab
 */
FactoryView.prototype.createCategoryIdName = function(name) {
  return 'tab_' + name;
};

/**
 * Switches a tab on or off.
 *
 * @param {!string} id ID of the tab to switch on or off.
 * @param {boolean} selected True if tab should be on, false if tab should be
 * off.
 */
FactoryView.prototype.setCategoryTabSelection = function(id, selected) {
  if (!this.tabMap[id]) {
    return;   // Exit if tab does not exist.
  }
  this.tabMap[id].className = selected ? 'tabon' : 'taboff';
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
 * @param {!string} filename Name of file
 * @param {!Blob} data Blob containing contents to download
 */
FactoryView.prototype.createAndDownloadFile = function(filename, data) {
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
  this.tabMap[id].id = this.createCategoryIdName(newName);
};

/**
 * Moves a tab from one index to another. Adjusts index inserting before
 * based on if inserting before or after. Checks that the indexes are in
 * bounds, throws error if not.
 *
 * @param {!string} id The ID of the category to move.
 * @param {int} newIndex The index to move the category to.
 * @param {int} oldIndex The index the category is currently at.
 */
FactoryView.prototype.moveTabToIndex = function(id, newIndex, oldIndex) {
  var table = document.getElementById('categoryTable');
  // Check that indexes are in bounds
  if (newIndex < 0 || newIndex >= table.rows.length || oldIndex < 0 ||
      oldIndex >= table.rows.length) {
    throw new Error('Index out of bounds when moving tab in the view.');
  }
  if (newIndex < oldIndex) {  // Inserting before.
    var row = table.insertRow(newIndex);
    row.appendChild(this.tabMap[id]);
    table.deleteRow(oldIndex + 1);
  } else {  // Inserting after.
    var row = table.insertRow(newIndex + 1);
    row.appendChild(this.tabMap[id]);
    table.deleteRow(oldIndex);
  }
};

/**
 * Given a category ID and color, use that color to color the left border of the
 * tab for that category.
 *
 * @param {!string} id The ID of the category to color.
 * @param {!string} color The color for to be used for the border of the tab.
 * Must be a valid CSS string.
 */
FactoryView.prototype.setBorderColor = function(id, color) {
  var tab = this.tabMap[id];
  tab.style.borderLeftWidth = "8px";
  tab.style.borderLeftStyle = "solid";
  tab.style.borderColor = color;
};

/**
 * Given a separator ID, creates a corresponding tab in the view, updates
 * tab map, and returns the tab.
 *
 * @param {!string} id The ID of the separator.
 * @param {!Element} The td DOM element representing the separator.
 */
FactoryView.prototype.addSeparatorTab = function(id) {
  // Create separator.
  var table = document.getElementById('categoryTable');
  var count = table.rows.length;
  var row = table.insertRow(count);
  var nextEntry = row.insertCell(0);
  // Configure separator.
  nextEntry.style.height = '10px';
  // Store and return separator.
  this.tabMap[id] = table.rows[count].cells[0];
  return nextEntry;
};

/**
 * Disables or enables the workspace by putting a div over or under the
 * toolbox workspace, depending on the value of disable. Used when switching
 * to/from separators where the user shouldn't be able to drag blocks into
 * the workspace.
 *
 * @param {boolean} disable True if the workspace should be disabled, false
 * if it should be enabled.
 */
FactoryView.prototype.disableWorkspace = function(disable) {
  document.getElementById('disable_div').style.zIndex = disable ? 1 : -1;
};
