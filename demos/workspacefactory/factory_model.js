/**
 * @fileoverview Stores and updates information about state and categories
 * in workspace factory. Keeps a map that for each category, stores
 * the xml to laod that category and all the blocks in that category. Also
 * stores the selected category and a boolean for if there are any categories
 * or if it's in "simple" mode (1 flyout).
 *
 * TODO(edauterman): Update comments to reflect idMap and fact that category
 * map is now keyed by a unique id
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

//string name of current selected category, null if no categories
FactoryModel.prototype.selectedId = null;

/**
 * Given a name, determines if it is the name of a category already present.
 *
 * @param {string} name string to be compared against
 * @return {boolean} true if string is a used category name, false otherwise
 */
FactoryModel.prototype.isCategory = function(name) {
  for (var category in this.idMap) {
    if (category == name) {
        return true;
    }
  }
  return false;
};

/**
 * Finds the next open category to switch to, excluding name. Returns null if
 * no categories left to switch to, and updates hasCategories to be false.
 * TODO(edauterman): Find a better tab than just the first tab in the map.
 *
 * @param {string} name of cateegory being deleted
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
 * Adds an empty category entry, updating state variables accordingly.
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
 * Returns category currently selected.
 *
 * @return {string} name of category currently selected
 */
FactoryModel.prototype.getSelectedId = function() {
  return this.selectedId;
};


/**
 * Sets category currently selected.
 *
 * @param {string} name name of category that should now be selected
 */
FactoryModel.prototype.setSelectedId = function(id) {
  this.selectedId = id;
}
/**
 * Captures the statue of a current category, updating its entry in categoryMap.
 */
FactoryModel.prototype.captureState = function(id) {
  if (!id) {  //never want to capture state for null
    return;
  }
  this.xmlMap[id] = Blockly.Xml.workspaceToDom(toolboxWorkspace);
};
/**
 * Returns the xml to load a given category
 *
 * @param {string} name name of category to fetch xml for
 * @return {!Element} xml element to be loaded to workspace
 */
FactoryModel.prototype.getXmlByName = function(name) {
  return this.xmlMap[this.idMap[name]];
};

/**
 * Returns the xml to load a given category
 *
 * @param {int} id id of category to fetch xml for
 * @return {!Element} xml element to be loaded to workspace
 */
FactoryModel.prototype.getXmlById = function(id) {
  return this.xmlMap[id];
};

/**
 * Returns xml for the blocks of a given category.
 *
 * @param {string} name name of category to fetch blocks for
 * @return{ !Array.<!Blockly.Block>} top level block objects
 */
/*FactoryModel.prototype.getBlocks = function(name) {
  return this.categoryMap[this.idMap[name]].blocks;
};*/

/**
 * Deletes a category entry and all associated data.
 *
 * @param {string} name of category to be deleted
 */
FactoryModel.prototype.deleteCategoryEntry = function(name) {
  var id = this.idMap[name];
  delete this.xmlMap[id];
  delete this.idMap[name];
  for (var i=0; i<this.categoryList.length; i++) { //performance problems? coordinate with model so only have 1 lookup
    if (this.categoryList[i] == name) {
      this.categoryList.splice(i, 1);
      window.console.log("Spliced");
      return; //unify to function for changing name
    }
  }
};

/**
 * Return map of category names that can be iterated over in a for-in loop.
 * Used when it is necessary to look through all categories.
 */
FactoryModel.prototype.getCategoryList = function() {
  return this.categoryList;
};

FactoryModel.prototype.getId = function(name) {
  return this.idMap[name];
}

FactoryModel.prototype.changeCategoryName = function (newName, id) {
  window.console.log("past break");
  this.idMap[newName] = id;
  for (var i=0; i<this.categoryList.length; i++) { //performance problems? coordinate with model so only have 1 lookup
    if (this.getId(this.categoryList[i]) == id) {
      window.console.log("updated");
      this.categoryList[i] = newName;
      break;
    }
  }
  for (var catName in this.idMap) {
    if (this.idMap[catName] == id) {
      delete this.idMap[catName];
      return;
    }
  }
};

FactoryModel.prototype.swapCategoryXml = function (id1, id2, name1, name2) {
  var temp = this.xmlMap[id1];
  this.xmlMap[id1] = this.xmlMap[id2];
  this.xmlMap[id2] = temp;
  this.idMap[name1] = id2;
  this.idMap[name2] = id1;
};

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
