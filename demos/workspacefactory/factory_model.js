/**
 * @fileoverview Stores and updates information about state and categories
 * in workspace factory. Each list element is either a separator or a category,
 * and each category stores its name, XML to load that category, color,
 * custom tags, and a unique ID making it possible to change category names and
 * move categories easily. Also keeps track of the currently selected list
 * element.
 *
 * @author Emma Dauterman (evd2014)
 */

/**
 * Class for a FactoryModel
 * @constructor
 */
FactoryModel = function() {
  // Ordered list of ListElement objects.
  this.toolboxList = [];
};

// String name of current selected list element, null if no list elements.
FactoryModel.prototype.selected = null;

/**
 * Given a name, determines if it is the name of a category already present.
 * Used when getting a valid category name from the user.
 *
 * @param {string} name String name to be compared against.
 * @return {boolean} True if string is a used category name, false otherwise.
 */
FactoryModel.prototype.hasCategoryByName = function(name) {
  for (var i = 0; i < this.toolboxList.length; i++) {
    if (this.toolboxList[i].type == ListElement.TYPE_CATEGORY &&
        this.toolboxList[i].name == name) {
      return true;
    }
  }
  return false;
};

/**
 * Determines if the user has any elements in the toolbox. Uses the length of
 * toolboxList.
 *
 * @return {boolean} True if categories exist, false otherwise.
 */
FactoryModel.prototype.hasToolbox = function() {
  return this.toolboxList.length > 0;
};

/**
 * Given a ListElement, adds it to the toolbox list.
 *
 * @param {!ListElement} element The element to be added to the list.
 */
FactoryModel.prototype.addElementToList = function(element) {
  this.toolboxList.push(element);
};

/**
 * Given an index, deletes a list element and all associated data.
 *
 * @param {int} index The index of the list element to delete.
 */
FactoryModel.prototype.deleteElementFromList = function(index) {
  if (index < 0 || index >= this.toolboxList.length) {
    return; // No entry to delete.
  }
  this.toolboxList.splice(index, 1);
};

/**
 * Moves a list element to a certain position in toolboxList by removing it
 * and then inserting it at the correct index. Checks that indices are in
 * bounds (throws error if not), but assumes that oldIndex is the correct index
 * for list element.
 *
 * @param {!ListElement} element The element to move in toolboxList.
 * @param {int} newIndex The index to insert the element at.
 * @param {int} oldIndex The index the element is currently at.
 */
FactoryModel.prototype.moveElementToIndex = function(element, newIndex,
    oldIndex) {
  // Check that indexes are in bounds.
  if (newIndex < 0 || newIndex >= this.toolboxList.length || oldIndex < 0 ||
      oldIndex >= this.toolboxList.length) {
    throw new Error('Index out of bounds when moving element in the model.');
  }
  this.deleteElementFromList(oldIndex);
  this.toolboxList.splice(newIndex, 0, element);
}

/**
 * Returns the ID of the currently selected element. Returns null if there are
 * no categories (if selected == null).
 *
 * @return {string} The ID of the element currently selected.
 */
FactoryModel.prototype.getSelectedId = function() {
  return this.selected ? this.selected.id : null;
};

/**
 * Returns the name of the currently selected category. Returns null if there
 * are no categories (if selected == null) or the selected element is not
 * a category (in which case its name is null).
 *
 * @return {string} The name of the category currently selected.
 */
FactoryModel.prototype.getSelectedName = function() {
  return this.selected ? this.selected.name : null;
};

/**
 * Returns the currently selected list element object.
 *
 * @return {ListElement} The currently selected ListElement
 */
FactoryModel.prototype.getSelected = function() {
  return this.selected;
};

/**
 * Sets list element currently selected by id.
 *
 * @param {string} id ID of list element that should now be selected.
 */
FactoryModel.prototype.setSelectedById = function(id) {
  this.selected = this.getElementById(id);
};

/**
 * Given an ID of a list element, returns the index of that list element in
 * toolboxList. Returns -1 if ID is not present.
 *
 * @param {!string} id The ID of list element to search for.
 * @return {int} The index of the list element in toolboxList, or -1 if it
 *     doesn't exist.
 */
FactoryModel.prototype.getIndexByElementId = function(id) {
  for (var i = 0; i < this.toolboxList.length; i++) {
    if (this.toolboxList[i].id == id) {
      return i;
    }
  }
  return -1;  // ID not present in toolboxList.
};

/**
 * Given the ID of a list element, returns that ListElement object.
 *
 * @param {!string} id The ID of element to search for.
 * @return {ListElement} Corresponding ListElement object in toolboxList, or
 *     null if that element does not exist.
 */
FactoryModel.prototype.getElementById = function(id) {
  for (var i = 0; i < this.toolboxList.length; i++) {
    if (this.toolboxList[i].id == id) {
      return this.toolboxList[i];
    }
  }
  return null;  // ID not present in toolboxList.
};

/**
 * Given the index of a list element in toolboxList, returns that ListElement
 * object.
 *
 * @param {int} index The index of the element to return.
 * @return {ListElement} The corresponding ListElement object in toolboxList.
 */
FactoryModel.prototype.getElementByIndex = function(index) {
  if (index < 0 || index >= this.toolboxList.length) {
    return null;
  }
  return this.toolboxList[index];
};

/**
 * Returns the xml to load the selected element.
 *
 * @return {!Element} The XML of the selected element, or null if there is
 * no selected element.
 */
FactoryModel.prototype.getSelectedXml = function() {
  return this.selected ? this.selected.xml : null;
};

/**
 * Return ordered list of ListElement objects.
 *
 * @return {!Array<!ListElement>} ordered list of ListElement objects
 */
FactoryModel.prototype.getToolboxList = function() {
  return this.toolboxList;
};

/**
 * Gets the ID of a category given its name.
 *
 * @param {string} name Name of category.
 * @return {int} ID of category
 */
FactoryModel.prototype.getCategoryIdByName = function(name) {
  for (var i = 0; i < this.toolboxList.length; i++) {
    if (this.toolboxList[i].name == name) {
      return this.toolboxList[i].id;
    }
  }
  return null;  // Name not present in toolboxList.
};

/**
 * Makes a copy of the original element, adds it to the toolboxList, and
 * returns it. Everything about the copy is identical except for its ID. Throws
 * an error if the original element is null.
 *
 * @param {!ListElement} original The category that should be copied.
 * @return {!ListElement} The copy of original.
 */
FactoryModel.prototype.copyElement = function(original) {
  if (!original) {
    throw new Error('Trying to copy null category.');
  }
  copy = new ListElement(ListElement.TYPE_CATEGORY, original.name);
  // Copy all attributes except ID.
  copy.type = original.type;
  copy.xml = original.xml;
  copy.color = original.color;
  copy.custom = original.custom;
  // Add copy to the category list and return it.
  this.toolboxList.push(copy);
  return copy;
};

FactoryModel.prototype.clearToolboxList = function() {
  this.toolboxList = [];
  // TODO: when merge changes, also clear shadowList
};


/**
 * Class for a ListElement
 * @constructor
 */
ListElement = function(type, opt_name) {
  this.type = type;
  // XML DOM element to load the element.
  this.xml = Blockly.Xml.textToDom('<xml></xml>');
  // Name of category. Can be changed by user. Null if separator.
  this.name = opt_name ? opt_name : null;
  // Unique ID of element. Does not change.
  this.id = Blockly.genUid();
  // Color of category. Default is no color. Null if separator.
  this.color = null;
  // Stores a custom tag, if necessary. Null if no custom tag or separator.
  this.custom = null;
};
// List element types.
ListElement.TYPE_CATEGORY = 'category';
ListElement.TYPE_SEPARATOR = 'separator';

/**
 * Saves a category by updating its XML (does not save XML for
 * elements that are not categories).
 *
 * @param {!Blockly.workspace} workspace The workspace to save category entry
 * from.
 */
ListElement.prototype.saveFromWorkspace = function(workspace) {
  // Only save list elements that are categories.
  if (this.type != ListElement.TYPE_CATEGORY) {
    return;
  }
  this.xml = Blockly.Xml.workspaceToDom(workspace);
};

/**
 * Changes the name of a category object given a new name. Returns if
 * not a category.
 *
 * @param {string} name New name of category.
 */
ListElement.prototype.changeName = function (name) {
  // Only update list elements that are categories.
  if (this.type != ListElement.TYPE_CATEGORY) {
    return;
  }
  this.name = name;
};

/**
 * Sets the color of a category. If tries to set the color of something other
 * than a category, returns.
 *
 * @param {!string} color The color that should be used for that category.
 */
ListElement.prototype.changeColor = function (color) {
  if (this.type != ListElement.TYPE_CATEGORY) {
    return;
  }
  this.color = color;
};

/**
 * Makes a copy of the original element and returns it. Everything about the
 * copy is identical except for its ID.
 *
 * @return {!ListElement} The copy of the ListElement.
 */
ListElement.prototype.copy = function() {
  copy = new ListElement(this.type);
  // Copy all attributes except ID.
  copy.name = this.name;
  copy.xml = this.xml;
  copy.color = this.color;
  copy.custom = this.custom;
  // Return copy.
  return copy;
};
