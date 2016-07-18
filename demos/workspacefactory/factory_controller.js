/**
 * @fileoverview Contains the controller code for workspace factory. Depends
 * on the model and view objects and interacts with previewWorkspace and
 * toolboxWorkspace. Provides the functionality for the actions the user
 * can initiate:
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
 * namespace for controller code for workspace factory
 * @namespace FactoryController
 */
FactoryController = {};

/**
 * Attached to "Add Category" button. Currently prompts the user for a name,
 * checking that it's valid (not used before), and then creates a tab and
 * switches to it.
 */
FactoryController.addCategory = function() {
  do {
    var name = prompt('Enter the name of your new category: ');
  } while (model.isCategory(name));
  if (!name) {  // If cancelled
    return;
  }
  model.addCategoryEntry(name);
  view.addCategoryRow(name);
  FactoryController.switchCategory(model.getId(name));
};

/**
 * Attached to "Remove Category" button. Prompts the user for a name, and
 * removes the specified category. Alerts the user and exits immediately if
 * the user tries to remove a nonexistent category. If currently on the category
 * being removed, switches to the first category added.
 *
 * TODO(edauterman): make case insensitive
 */
FactoryController.removeCategory = function() {
  var name = prompt('Enter the name of your category to remove: ');
  if (!model.isCategory(name)) {
    alert('No such category to delete.');
    return;
  }
  if (model.getId(name) == model.getSelectedId()) {
    var next = model.getNextOpenCategory(name);
    FactoryController.switchCategory(next);
  }
  model.deleteCategoryEntry(name);
  view.deleteCategoryRow(name);
};

/**
 * Switches to a new tab for the category given by name. Stores XML and blocks
 * to reload later, updates selected accordingly, and clears the workspace
 * and clears undo, then loads the new category. Special case if selected =
 * null, meaning it's the first category so category information doesn't need
 * to be stored. Also special case if switching to null, meaning that it's
 * switching back to no categories.
 * TODO(edauterman): If they've put blocks in a "simple" flyout, give the user
 * the option to put these blocks in a category so they don't lose all their
 * work.
 *
 * @param {!string} id ID of tab to be opened, must be valid category ID
 */
FactoryController.switchCategory = function(id) {
  if (id == null) {
    toolboxWorkspace.clear();
    toolboxWorkspace.clearUndo();
    model.setSelectedId(null);
    return;
  }
  var table = document.getElementById('categoryTable');
  // Caches information to reload or generate xml if switching from category.
  if (model.getSelectedId() != null) {
      model.captureState(model.getSelectedId());
      view.toggleTab(model.getSelectedId(),false);
  }
  view.toggleTab(id,true);
  model.setSelectedId(id);
  toolboxWorkspace.clear();
  toolboxWorkspace.clearUndo();
  Blockly.Xml.domToWorkspace(model.getXmlById(id), toolboxWorkspace);
};

/**
 * Tied to "Export Config" button. Gets a file name from the user and downloads
 * the corresponding configuration xml to that file.
 */
FactoryController.exportConfig = function() {
   var configXml = Blockly.Xml.domToPrettyText
      (FactoryGenerator.generateConfigXml());
   var fileName = prompt("File Name: ");
   view.createAndDownloadFile(configXml, fileName, 'xml');
 };

/**
 * Tied to "Print Config" button. Mainly used for debugging purposes. Prints
 * the configuration XML to the console.
 */
FactoryController.printConfig = function() {
  window.console.log(Blockly.Xml.domToPrettyText
      (FactoryGenerator.generateConfigXml()));
};

/**
 * Tied to "Update Preview" button. Updates the preview workspace based on
 * the toolbox workspace. If no categories, creates a simple flyout. If
 * switching from no categories to categories or categories to no categories,
 * reinjects Blockly with reinjectPreview (more expensive, but shows automatic
 * creation of trashcan, scrollbar, etc.). If updating simple or category
 * display, just updates without reinjecting.
 */
FactoryController.updatePreview = function() {
  var tree = Blockly.Options.parseToolboxTree
      (FactoryGenerator.generateConfigXml());
  if (tree.getElementsByTagName('category').length==0) {
    if (previewWorkspace.toolbox_){
      FactoryController.reinjectPreview(tree);
    } else {
    previewWorkspace.flyout_.show(tree.childNodes);
    }
  } else {
    if (!previewWorkspace.toolbox_) {
      FactoryController.reinjectPreview(tree);
    } else {
      previewWorkspace.toolbox_.populate_(tree);
    }
  }
};

/**
 * Used to completely reinject the preview workspace. Done when switching from
 * simple flyout to categories, or categories to simple flyout. More expensive.
 *
 * @param {!Element} tree of xml elements
 */
FactoryController.reinjectPreview = function(tree) {
  previewWorkspace.dispose();
  previewToolbox = Blockly.Xml.domToPrettyText(tree);
  previewWorkspace = Blockly.inject('preview_blocks',
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
FactoryController.changeName = function() {
  if (!model.getSelectedId()) {
    alert("No current categories created.");
    return;
  }
  do {
    var newName = prompt("What do you want to change this category's name to?");
  } while (model.isCategory(name));
  if (!newName) { // If cancelled
    return;
  }
  model.changeCategoryName(newName,model.getSelectedId());
  view.updateCategoryName(newName,model.getSelectedId());
};

/**
 * Tied to arrow up and arrow down keys. On pressing the up or down key, moves
 * the selected category up or down one space in the list of categories.
 *
 * @param {Event} e keyboard event received, called onkeydown
 */
FactoryController.moveCategory = function(e) {
  if ((e.key != 'ArrowUp' && e.key != 'ArrowDown') || !model.getSelectedId()) {
    return; // Do nothing if not arrow up or arrow down, or no categories.
  }
  var names = view.swapCategories(model.getSelectedId(), e.key == 'ArrowUp');
  if (!names) { // No valid category to swap with.
    return;
  }
  var currID = model.getSelectedId();
  var swapID = model.getId(names.swap);
  model.captureState(currID);
  model.swapCategoryId(currID, swapID, names.curr, names.swap);
  model.swapCategoryOrder(names.curr, names.swap);
  model.setSelectedId(swapID);
  FactoryController.switchCategory(swapID);
};
