/**
 * @fileoverview Contains the controller code for workspace factory. Depends
 * on the model and view objects (created as internal variables) and interacts
 * with previewWorkspace and toolboxWorkspace (internal references stored to
 * both). Provides the functionality for the actions the user can initiate:
 * - adding and removing categories
 * - switching between categories
 * - printing and downloading configuration xml
 * - updating the preview workspace
 * - changing a category name
 * - moving the position of a category.
 *
 * @author Emma Dauterman (edauterman)
 */

/**
 * Class for a FactoryController
 * @constructor
 * @param {!Blockly.workspace} toolboxWorkspace workspace where blocks are
 * dragged into corresponding categories
 * @param {!Blockly.workspace} previewWorkspace workspace that shows preview
 * of what workspace would look like using generated XML
 */
FactoryController = function(toolboxWorkspace, previewWorkspace) {
  this.toolboxWorkspace = toolboxWorkspace;
  this.previewWorkspace = previewWorkspace;
  this.model = new FactoryModel();
  this.view = new FactoryView();
  this.generator = new FactoryGenerator(this.model, this.toolboxWorkspace);
};

/**
 * Attached to "Add Category" button. Currently prompts the user for a name,
 * checking that it's valid (not used before), and then creates a tab and
 * switches to it.
 */
FactoryController.prototype.addCategory = function() {
  var name = prompt('Enter the name of your new category: ');
  while (this.model.hasCategory(name)){
    name = prompt('That name is already in use. Please enter another name: ');
  }
  if (!name) {  // If cancelled.
    return;
  }
  this.model.addCategoryEntry(name);
  var tab = this.view.addCategoryRow(name, this.model.getId(name));
  var self = this;
  var clickFunction = function(id) {  // Keep this in scope for switchCategory
    return function() {
      self.switchCategory(id);
    };
  };
  this.view.bindClick(tab, clickFunction(this.model.getId(name)));
  this.switchCategory(this.model.getId(name));
};

/**
 * Attached to "Remove Category" button. Prompts the user for a name, and
 * removes the specified category. Alerts the user and exits immediately if
 * the user tries to remove a nonexistent category. If currently on the category
 * being removed, prompts if user is sure about switching, then switches to the
 * category above or below.
 *
 * TODO(edauterman): make case insensitive
 */
FactoryController.prototype.removeCategory = function() {
  var name = prompt('Enter the name of your category to remove: ');
  if (!this.model.hasCategory(name)) {
    if (!name) {  // Return if cancelled.
      return;
    }
    alert('No such category to delete.');
    return;
  }
  if (this.model.getId(name) == this.model.getSelectedId()) {
    var check = prompt('Are you sure you want to delete the currently selected'
        + ' category? ');
    if (check.toLowerCase() != 'yes') {
      return;
    }
    var next = this.model.getNextOpenCategory(name);
    this.switchCategory(next);
  }
  this.view.deleteCategoryRow(name, this.model.getId(name));
  this.model.deleteCategoryEntry(name);
};

/**
 * Switches to a new tab for the category given by name. Stores XML and blocks
 * to reload later, updates selected accordingly, and clears the workspace
 * and clears undo, then loads the new category.
 * TODO(edauterman): If they've put blocks in a "simple" flyout, give the user
 * the option to put these blocks in a category so they don't lose all their
 * work.
 *
 * @param {!string} id ID of tab to be opened, must be valid category ID
 */
FactoryController.prototype.switchCategory = function(id) {
  var table = document.getElementById('categoryTable');
  // Caches information to reload or generate xml if switching to/from category.
  if (this.model.getSelectedId() != null && id != null) {
      this.model.captureState(this.model.getSelectedId(),
          this.toolboxWorkspace);
      this.view.setCategoryTabSelection(this.model.getSelectedId(), false);
  }
  this.model.setSelectedId(id);
  this.toolboxWorkspace.clear();
  this.toolboxWorkspace.clearUndo();
  if (id != null) { // Loads next category if switching to a category.
    this.view.setCategoryTabSelection(id, true);
    Blockly.Xml.domToWorkspace(this.model.getXmlById(id),
        this.toolboxWorkspace);
  }
};

/**
 * Tied to "Export Config" button. Gets a file name from the user and downloads
 * the corresponding configuration xml to that file.
 */
FactoryController.prototype.exportConfig = function() {
   var configXml = Blockly.Xml.domToPrettyText
      (this.generator.generateConfigXml());
   var fileName = prompt("File Name: ");
   if (!fileName) { // If cancelled
    return;
   }
   var data = new Blob([configXml], {type: 'text/xml'});
   this.view.createAndDownloadFile(fileName, data);
 };

/**
 * Tied to "Print Config" button. Mainly used for debugging purposes. Prints
 * the configuration XML to the console.
 */
FactoryController.prototype.printConfig = function() {
  window.console.log(Blockly.Xml.domToPrettyText
      (this.generator.generateConfigXml()));
};

/**
 * Tied to "Update Preview" button. Updates the preview workspace based on
 * the toolbox workspace. If switching from no categories to categories or
 * categories to no categories, reinjects Blockly with reinjectPreview,
 * otherwise just updates without reinjecting.
 */
FactoryController.prototype.updatePreview = function() {
  var tree = Blockly.Options.parseToolboxTree
      (this.generator.generateConfigXml());
  if (tree.getElementsByTagName('category').length == 0) {
    if (this.previewWorkspace.toolbox_) {
      this.reinjectPreview(tree);
    } else {
      this.previewWorkspace.flyout_.show(tree.childNodes);
    }
  } else {
    if (!previewWorkspace.toolbox_) {
      this.reinjectPreview(tree);
    } else {
      this.previewWorkspace.toolbox_.populate_(tree);
    }
  }
};

/**
 * Used to completely reinject the preview workspace. Use only when switching
 * from simple flyout to categories, or categories to simple flyout. More
 * expensive than simply updating the flyout or toolbox.
 *
 * @param {!Element} tree of xml elements
 */
FactoryController.prototype.reinjectPreview = function(tree) {
  this.previewWorkspace.dispose();
  previewToolbox = Blockly.Xml.domToPrettyText(tree);
  this.previewWorkspace = Blockly.inject('preview_blocks',
    {grid:
      {spacing: 25,
       length: 3,
       colour: '#ccc',
       snap: true},
     media: '../../media/',
     toolbox: previewToolbox,
     zoom:
       {controls: true,
        wheel: true}
    });
};

/**
 * Tied to "change name" button. Changes the name of the selected category.
 * Continues prompting the user until they input a category name that is not
 * currently in use, exits if user presses cancel. Doesn't allow the user to
 * change a category name if there are no categories.
 */
FactoryController.prototype.changeName = function() {
  if (!this.model.getSelectedId()) {
    alert("No current categories created.");
    return;
  }
  do {
    var newName = prompt("What do you want to change this category's name to?");
  } while (this.model.hasCategory(name));
  if (!newName) { // If cancelled
    return;
  }
  this.model.changeCategoryName(newName,this.model.getSelectedId());
  this.view.updateCategoryName(newName,this.model.getSelectedId());
};

/**
 * Tied to arrow up and arrow down keys. On pressing the up or down key, moves
 * the selected category up or down one space in the list of categories.
 *
 * @param {Event} e keyboard event received, called onkeydown
 */
FactoryController.prototype.moveCategory = function(e) {
  if ((e.key != 'ArrowUp' && e.key != 'ArrowDown') ||
      !this.model.getSelectedId()) {
    return; // Do nothing if not arrow up or arrow down, or no categories.
  }
  var names = this.view.swapCategories(this.model.getSelectedId(),
      e.key == 'ArrowUp');
  if (!names) { // No valid category to swap with.
    return;
  }
  var currID = this.model.getSelectedId();
  var swapID = this.model.getId(names.swap);
  this.model.captureState(currID);
  this.model.swapCategoryId(currID, swapID, names.curr, names.swap);
  this.model.swapCategoryOrder(names.curr, names.swap);
  this.model.setSelectedId(swapID);
  this.switchCategory(swapID);
};
