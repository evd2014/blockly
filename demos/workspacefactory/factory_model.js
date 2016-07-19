/**
 * @fileoverview Stores and updates information about state and categories
 * in workspace factory. Each category has a unique ID making it possible to
 * change category names and move categories easily. Data is stored for each
 * category in these data structures:
 * - xmlMap: stores xml for each category by ID
 * - idMap: stores id for each category by name
 * - categoryList: ordered list of all categories by name
 *
 * Also keeps track of the ID of the currently selected category (null if there
 * are no categories, which is the case if all the blocks are in 1 flyout).
 *
 * @author Emma Dauterman (edauterman)
 */

/**
 * Class for a FactoryModel
 * @constructor
 */
FactoryModel = function() {
  this.xmlMap = Object.create(null);
  this.idMap = Object.create(null);
  this.categoryList = [];
};

// String name of current selected category, null if no categories
FactoryModel.prototype.selectedId = null;

/**
 * Given a name, determines if it is the name of a category already present.
 *
 * @param {string} name string to be compared against
 * @return {boolean} true if string is a used category name, false otherwise
 */
FactoryModel.prototype.hasCategory = function(name) {
  for (var category in this.idMap) {
    if (category == name) {
        return true;
    }
  }
  return false;
};

/**
 * Finds the next open category to switch to, excluding name. Returns null if
 * no categories left to switch to. The next category is chosen as follows:
 * if there is a category before the deleted category, that category is chosen,
 * if there is no category before the deleted category, then the category
 * directly after is chosen, and if there is no category before or after,
 * then there must be no other categories, and so it returns null to signal
 * that there is no current category.
 *
 * @param {!string} name of cateegory being deleted
 * @return {string} name of next category to switch to
 */
FactoryModel.prototype.getNextOpenCategory = function(name){
  for (var i=0; i<this.categoryList.length; i++) {
    if (this.categoryList[i] == name) {
      if (i != 0) {
        return this.getId(this.categoryList[i-1]);
      } else if (i != this.categoryList.length - 1){
        return this.getId(this.categoryList[i+1]);
      } else {
        return null;
      }
    }
  }
};

/**
 * Adds an empty category entry, updating state variables accordingly. Generates
 * the unique ID for the category and adds the category to the next space on
 * the list.
 *
 * @param {string} name name of category to be added
 */
FactoryModel.prototype.addCategoryEntry = function(name) {
  var id = Blockly.genUid();
  this.xmlMap[id] = Blockly.Xml.textToDom('<xml></xml>');
  this.idMap[name] = id;
  this.categoryList.push(name);
};

/**
 * Deletes a category entry and all associated data given a category name.
 *
 * @param {string} name of category to be deleted
 */
FactoryModel.prototype.deleteCategoryEntry = function(name) {
  var id = this.idMap[name];
  delete this.xmlMap[id];
  delete this.idMap[name];
  for (var i=0; i<this.categoryList.length; i++) {
    if (this.categoryList[i] == name) {
      this.categoryList.splice(i, 1);
      return;
    }
  }
};

/**
 * Returns id of category currently selected.
 *
 * @return {int} id of category currently selected
 */
FactoryModel.prototype.getSelectedId = function() {
  return this.selectedId;
};


/**
 * Sets category currently selected by id.
 *
 * @param {int} id ID of category that should now be selected
 */
FactoryModel.prototype.setSelectedId = function(id) {
  this.selectedId = id;
}
/**
 * Captures the statue of a current category, updating its entry in categoryMap.
 *
 * @param {int} id ID of category to capture state for
 */
FactoryModel.prototype.captureState = function(id) {
  if (!id) {  // Never want to capture state for null
    return;
  }
  this.xmlMap[id] = Blockly.Xml.workspaceToDom(toolboxWorkspace);
};
/**
 * Returns the xml to load a given category by name
 *
 * @param {string} name name of category to fetch xml for
 * @return {!Element} xml element to be loaded to workspace
 */
FactoryModel.prototype.getXmlByName = function(name) {
  return this.xmlMap[this.idMap[name]];
};

/**
 * Returns the xml to load a given category by id
 *
 * @param {int} id ID of category to fetch xml for
 * @return {!Element} xml element to be loaded to workspace
 */
FactoryModel.prototype.getXmlById = function(id) {
  return this.xmlMap[id];
};

/**
 * Return ordered list category names.
 */
FactoryModel.prototype.getCategoryList = function() {
  return this.categoryList;
};

/**
 * Gets the ID of a category given its name.
 *
 * @param {string} name Name of category
 * @return {int} ID of category
 */
FactoryModel.prototype.getId = function(name) {
  return this.idMap[name];
}

/**
 * Changes the name of a category given its new name and ID. Updates it in
 * the category list, creates a new entry in the ID map, and deletes the old
 * entry in the ID map.
 *
 * @param {string} newName New name of category
 * @param {int} id ID of category to be updated
 */
FactoryModel.prototype.changeCategoryName = function (newName, id) {
  for (var i=0; i<this.categoryList.length; i++) {
    if (this.getId(this.categoryList[i]) == id) {
      this.categoryList[i] = newName;
      break;
    }
  }
  this.idMap[newName] = id;
  for (var catName in this.idMap) {
    if (this.idMap[catName] == id) {
      delete this.idMap[catName];
      return;
    }
  }
};

/**
 * Swaps the IDs of two categories while keeping the XML and names associated
 * with a category the same. Used when swapping categories so that same tab
 * can now refer to a different category.
 *
 * @param {!string} id1 ID of first category to be swapped
 * @param {!string} id2 ID of second category to be swapped
 * @param {!string} name1 name of first category to be swapped
 * @param {!string} name2 name of second category to be swapped
 */
FactoryModel.prototype.swapCategoryId = function (id1, id2, name1, name2) {
  var temp = this.xmlMap[id1];
  this.xmlMap[id1] = this.xmlMap[id2];
  this.xmlMap[id2] = temp;
  this.idMap[name1] = id2;
  this.idMap[name2] = id1;
};

/**
 * Swaps the order of two categories in the category list.
 *
 * @param name1 Name of first category to swap
 * @param name2 Name of second category to swap
 */
FactoryModel.prototype.swapCategoryOrder = function(name1, name2) {
  for (var i=0; i<this.categoryList.length; i++) {
    if (this.categoryList[i] == name1) {
      var index1 = i;
    }
    if (this.categoryList[i] == name2) {
      var index2 = i;
    }
  }
  this.categoryList[index1] = name2;
  this.categoryList[index2] = name1;
};
