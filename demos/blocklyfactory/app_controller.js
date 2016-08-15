/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview The AppController Class brings together the Block
 * Factory, Block Library, and Block Exporter functionality into a single web
 * app.
 *
 * @author quachtina96 (Tina Quach)
 */
goog.provide('AppController');

goog.require('BlockFactory');
goog.require('BlockLibraryController');
goog.require('BlockExporterController');
goog.require('goog.dom.classlist');
goog.require('goog.string');
goog.require('goog.ui.PopupColorPicker');
goog.require('goog.ui.ColorPicker');

/**
 * Controller for the Blockly Factory
 * @constructor
 */
AppController = function() {
  // Initialize Block Library
  this.blockLibraryName = 'blockLibrary';
  this.blockLibraryController =
      new BlockLibraryController(this.blockLibraryName);
  this.blockLibraryController.populateBlockLibrary();

  // Create empty workspace for configuring workspace.
  var toolbox = document.getElementById('workspacefactory_toolbox');
  var toolboxWorkspace = Blockly.inject('toolbox_blocks',
    {grid:
      {spacing: 25,
       length: 3,
       colour: '#ccc',
       snap: true},
       media: '../../media/',
       toolbox: toolbox,
     });
  // Create empty workspace for previewing created workspace.
  var previewWorkspace = Blockly.inject('preview_blocks',
    {grid:
      {spacing: 25,
       length: 3,
       colour: '#ccc',
       snap: true},
     media: '../../media/',
     toolbox: '<xml></xml>',
     zoom:
       {controls: true,
        wheel: true}
    });

  // Construct Workspace Factory Controller.
  this.workspaceFactoryController =
      new FactoryController(toolboxWorkspace, previewWorkspace);

  // Initialize Block Exporter
  this.exporter =
      new BlockExporterController(this.blockLibraryController.storage);

  // Map of tab type to the div element for the tab.
  this.tabMap = {
    'BLOCK_FACTORY' : goog.dom.getElement('blockFactory_tab'),
    'WORKSPACE_FACTORY': goog.dom.getElement('workspaceFactory_tab'),
    'EXPORTER' : goog.dom.getElement('blocklibraryExporter_tab')
  };

  // Selected tab.
  this.selectedTab = 'BLOCK_FACTORY';
};

/**
 * Tied to the 'Import Block Library' button. Imports block library from file to
 * Block Factory. Expects user to upload a single file of JSON mapping each
 * block type to its xml text representation.
 */
AppController.prototype.importBlockLibraryFromFile = function() {
  var self = this;
  var files = document.getElementById('files');
  // If the file list is empty, the user likely canceled in the dialog.
  if (files.files.length > 0) {
    // The input tag doesn't have the "multiple" attribute
    // so the user can only choose 1 file.
    var file = files.files[0];
    var fileReader = new FileReader();

    // Create a map of block type to xml text from the file when it has been
    // read.
    fileReader.addEventListener('load', function(event) {
      var fileContents = event.target.result;
      // Create empty object to hold the read block library information.
      var blockXmlTextMap = Object.create(null);
      try {
        // Parse the file to get map of block type to xml text.
        blockXmlTextMap = self.formatBlockLibForImport_(fileContents);
      } catch (e) {
        var message = 'Could not load your block library file.\n'
        window.alert(message + '\nFile Name: ' + file.name);
        return;
      }

      // Create a new block library storage object with inputted block library.
      var blockLibStorage = new BlockLibraryStorage(
          self.blockLibraryName, blockXmlTextMap);

      // Update block library controller with the new block library
      // storage.
      self.blockLibraryController.setBlockLibStorage(blockLibStorage);
      // Update the block library dropdown.
      self.blockLibraryController.populateBlockLibrary();
      // Update the exporter's block library storage.
      self.exporter.setBlockLibStorage(blockLibStorage);
    });
    // Read the file.
    fileReader.readAsText(file);
  }
};

/**
 * Tied to the 'Export Block Library' button. Exports block library to file that
 * contains JSON mapping each block type to its xml text representation.
 */
AppController.prototype.exportBlockLibraryToFile = function() {
  // Get map of block type to xml.
  var blockLib = this.blockLibraryController.getBlockLibrary();
  // Concatenate the xmls, each separated by a blank line.
  var blockLibText = this.formatBlockLibForExport_(blockLib);
  // Get file name.
  var filename = prompt('Enter the file name under which to save your block' +
      'library.');
  // Download file if all necessary parameters are provided.
  if (filename) {
    BlockFactory.createAndDownloadFile_(blockLibText, filename, 'xml');
  } else {
    alert('Could not export Block Library without file name under which to ' +
      'save library.');
  }
};

/**
 * Converts an object mapping block type to xml to text file for output.
 * @private
 *
 * @param {!Object} blockXmlMap - object mapping block type to xml
 * @return {string} String of each block's xml separated by a new line.
 */
AppController.prototype.formatBlockLibForExport_ = function(blockXmlMap) {
  var blockXmls = [];
  for (var blockType in blockXmlMap) {
    blockXmls.push(blockXmlMap[blockType]);
  }
  return blockXmls.join("\n\n");
};

/**
 * Converts imported block library to an object mapping block type to block xml.
 * @private
 *
 * @param {string} xmlText - String containing each block's xml optionally
 *    separated by whitespace.
 * @return {!Object} object mapping block type to xml text.
 */
AppController.prototype.formatBlockLibForImport_ = function(xmlText) {
  // Get array of xmls.
  var xmlText = goog.string.collapseWhitespace(xmlText);
  var blockXmls = goog.string.splitLimit(xmlText, '</xml>', 500);

  // Create and populate map.
  var blockXmlTextMap = Object.create(null);
  // The line above is equivalent of {} except that this object is TRULY
  // empty. It doesn't have built-in attributes/functions such as length or
  // toString.
  for (var i = 0, xml; xml = blockXmls[i]; i++) {
    var blockType = this.getBlockTypeFromXml_(xml);
    blockXmlTextMap[blockType] = xml;
  }

  return blockXmlTextMap;
};

/**
 * Extracts out block type from xml text, the kind that is saved in block
 * library storage.
 * @private
 *
 * @param {!string} xmlText - A block's xml text.
 * @return {string} The block type that corresponds to the provided xml text.
 */
AppController.prototype.getBlockTypeFromXml_ = function(xmlText) {
  var xmlText = Blockly.Options.parseToolboxTree(xmlText);
  // Find factory base block.
  var factoryBaseBlockXml = xmlText.getElementsByTagName('block')[0];
  // Get field elements from factory base.
  var fields = factoryBaseBlockXml.getElementsByTagName('field');
  for (var i = 0; i < fields.length; i++) {
    // The field whose name is 'NAME' holds the block type as its value.
    if (fields[i].getAttribute('name') == 'NAME') {
      return fields[i].childNodes[0].nodeValue;
    }
  }
};

/**
 * Updates the Block Factory tab to show selected block when user selects a
 * different block in the block library dropdown. Tied to block library dropdown
 * in index.html.
 *
 * @param {!Element} blockLibraryDropdown - HTML select element from which the
 *    user selects a block to work on.
 */
AppController.prototype.onSelectedBlockChanged = function(blockLibraryDropdown) {
  // Get selected block type.
  var blockType = this.blockLibraryController.getSelectedBlockType(
      blockLibraryDropdown);
  // Update Block Factory page by showing the selected block.
  this.blockLibraryController.openBlock(blockType);
};

/**
 * Add click handlers to each tab to allow switching between the Block Factory,
 * Workspace Factory, and Block Exporter tab.
 *
 * @param {!Object} tabMap - Map of tab name to div element that is the tab.
 */
AppController.prototype.addTabHandlers = function(tabMap) {
  var self = this;
  for (var tabName in tabMap) {
    var tab = tabMap[tabName];
    // Use an additional closure to correctly assign the tab callback.
    tab.addEventListener('click', self.makeTabClickHandler_(tabName));
  }
};

/**
 * Set the selected tab.
 * @private
 *
 * @param {string} tabName 'BLOCK_FACTORY', 'WORKSPACE_FACTORY', or 'EXPORTER'
 */
AppController.prototype.setSelected_ = function(tabName) {
  this.selectedTab = tabName;
};

/**
 * Creates the tab click handler specific to the tab specified.
 * @private
 *
 * @param {string} tabName 'BLOCK_FACTORY', 'WORKSPACE_FACTORY', or 'EXPORTER'
 * @return {Function} The tab click handler.
 */
AppController.prototype.makeTabClickHandler_ = function(tabName) {
  var self = this;
  return function() {
    self.setSelected_(tabName);
    self.onTab();
  };
};

/**
 * Called on each tab click. Hides and shows specific content based on which tab
 * (Block Factory, Workspace Factory, or Exporter) is selected.
 *
 * TODO(quachtina96): Refactor the code to avoid repetition of addRemove.
 */
AppController.prototype.onTab = function() {
  // Get tab div elements.
  var blockFactoryTab = this.tabMap['BLOCK_FACTORY'];
  var exporterTab = this.tabMap['EXPORTER'];
  var workspaceFactoryTab = this.tabMap['WORKSPACE_FACTORY'];

  if (this.selectedTab == 'EXPORTER') {
    // Turn exporter tab on and other tabs off.
    goog.dom.classlist.addRemove(exporterTab, 'taboff', 'tabon');
    goog.dom.classlist.addRemove(blockFactoryTab, 'tabon', 'taboff');
    goog.dom.classlist.addRemove(workspaceFactoryTab, 'tabon', 'taboff');

    // Update toolbox to reflect current block library.
    this.exporter.updateToolbox();

    // Show container of exporter.
    BlockFactory.show('blockLibraryExporter');
    BlockFactory.hide('workspaceFactoryContent');

  } else if (this.selectedTab ==  'BLOCK_FACTORY') {
    // Turn factory tab on and other tabs off.
    goog.dom.classlist.addRemove(blockFactoryTab, 'taboff', 'tabon');
    goog.dom.classlist.addRemove(exporterTab, 'tabon', 'taboff');
    goog.dom.classlist.addRemove(workspaceFactoryTab, 'tabon', 'taboff');

    // Hide container of exporter.
    BlockFactory.hide('blockLibraryExporter');
    BlockFactory.hide('workspaceFactoryContent');

  } else if (this.selectedTab == 'WORKSPACE_FACTORY') {
    console.log('workspaceFactoryTab');
    goog.dom.classlist.addRemove(workspaceFactoryTab, 'taboff', 'tabon');
    goog.dom.classlist.addRemove(blockFactoryTab, 'tabon', 'taboff');
    goog.dom.classlist.addRemove(exporterTab, 'tabon', 'taboff');
    // Hide container of exporter.
    BlockFactory.hide('blockLibraryExporter');
    // Show workspace factory container.
    BlockFactory.show('workspaceFactoryContent');
  }

  // Resize to render workspaces' toolboxes correctly for all tabs.
  window.dispatchEvent(new Event('resize'));
};

/**
 * Assign button click handlers for the exporter.
 */
AppController.prototype.assignExporterClickHandlers = function() {
  var self = this;
  // Export blocks when the user submits the export settings.
  document.getElementById('button_setBlocks').addEventListener('click',
      function() {
        document.getElementById('dropdownDiv_setBlocks').classList.toggle("show");
      });

  document.getElementById('dropdown_addAllUsed').addEventListener('click',
      function() {
        self.exporter.export();
        document.getElementById('dropdownDiv_setBlocks').classList.remove("show");
      });

  document.getElementById('dropdown_clearSelected').addEventListener('click',
      function() {
        self.exporter.clearSelectedBlocks();
        document.getElementById('dropdownDiv_setBlocks').classList.remove("show");
      });

  document.getElementById('dropdown_addAllFromLib').addEventListener('click',
      function() {
        self.exporter.addAllBlocksToWorkspace();
        document.getElementById('dropdownDiv_setBlocks').classList.remove("show");
      });
};

/**
 * Assign button click handlers for the block library.
 */
AppController.prototype.assignLibraryClickHandlers = function() {
  var self = this;
  // Assign button click handlers for Block Library.
  document.getElementById('saveToBlockLibraryButton').addEventListener('click',
      function() {
        self.blockLibraryController.saveToBlockLibrary();
      });

  document.getElementById('removeBlockFromLibraryButton').addEventListener(
    'click',
      function() {
        self.blockLibraryController.removeFromBlockLibrary();
      });

  document.getElementById('clearBlockLibraryButton').addEventListener('click',
      function() {
        self.blockLibraryController.clearBlockLibrary();
      });

  var dropdown = document.getElementById('blockLibraryDropdown');
  dropdown.addEventListener('change',
      function() {
        self.onSelectedBlockChanged(dropdown);
      });
};

/**
 * Assign button click handlers for the block factory.
 */
AppController.prototype.assignBlockFactoryClickHandlers = function() {
  var self = this;
  // Assign button event handlers for Block Factory.
  document.getElementById('localSaveButton')
      .addEventListener('click', function() {
        self.exportBlockLibraryToFile();
      });

  document.getElementById('helpButton').addEventListener('click',
      function() {
        open('https://developers.google.com/blockly/custom-blocks/block-factory',
             'BlockFactoryHelp');
      });

  document.getElementById('downloadBlocks').addEventListener('click',
      function() {
        BlockFactory.downloadTextArea('blocks', 'languagePre');
      });

  document.getElementById('downloadGenerator').addEventListener('click',
      function() {
        BlockFactory.downloadTextArea('generator', 'generatorPre');
      });

  document.getElementById('files').addEventListener('change',
      function() {
        // Warn user.
        var replace = confirm('This imported block library will ' +
            'replace your current block library.');
        if (replace) {
          self.importBlockLibraryFromFile();
          // Clear this so that the change event still fires even if the
          // same file is chosen again. If the user re-imports a file, we
          // want to reload the workspace with its contents.
          this.value = null;
        }
      });

  document.getElementById('createNewBlockButton')
    .addEventListener('click', function() {
        BlockFactory.mainWorkspace.clear();
        BlockFactory.showStarterBlock();
        BlockLibraryView.selectDefaultOption('blockLibraryDropdown');
    });
};

/**
 * Add event listeners for the block factory.
 */
AppController.prototype.addBlockFactoryEventListeners = function() {
  BlockFactory.mainWorkspace.addChangeListener(BlockFactory.updateLanguage);
  document.getElementById('direction')
      .addEventListener('change', BlockFactory.updatePreview);
  document.getElementById('languageTA')
      .addEventListener('change', BlockFactory.updatePreview);
  document.getElementById('languageTA')
      .addEventListener('keyup', BlockFactory.updatePreview);
  document.getElementById('format')
      .addEventListener('change', BlockFactory.formatChange);
  document.getElementById('language')
      .addEventListener('change', BlockFactory.updatePreview);
};

/**
 * Handle Blockly Storage with App Engine.
 */
AppController.prototype.initializeBlocklyStorage = function() {
  BlocklyStorage.HTTPREQUEST_ERROR =
      'There was a problem with the request.\n';
  BlocklyStorage.LINK_ALERT =
      'Share your blocks with this link:\n\n%1';
  BlocklyStorage.HASH_ERROR =
      'Sorry, "%1" doesn\'t correspond with any saved Blockly file.';
  BlocklyStorage.XML_ERROR = 'Could not load your saved file.\n' +
      'Perhaps it was created with a different version of Blockly?';
  var linkButton = document.getElementById('linkButton');
  linkButton.style.display = 'inline-block';
  linkButton.addEventListener('click',
      function() {
          BlocklyStorage.link(BlockFactory.mainWorkspace);});
  BlockFactory.disableEnableLink();
};

/**
 * Initialize Blockly and layout.  Called on page load.
 */
AppController.prototype.init = function() {
  // Handle Blockly Storage with App Engine
  if ('BlocklyStorage' in window) {
    this.initializeBlocklyStorage();
  }

  // Assign click handlers.
  this.assignExporterClickHandlers();
  this.assignLibraryClickHandlers();
  this.assignBlockFactoryClickHandlers();

  // Handle resizing of Block Factory elements.
  var expandList = [
    document.getElementById('blockly'),
    document.getElementById('blocklyMask'),
    document.getElementById('preview'),
    document.getElementById('languagePre'),
    document.getElementById('languageTA'),
    document.getElementById('generatorPre')
  ];

  var onresize = function(e) {
    for (var i = 0, expand; expand = expandList[i]; i++) {
      expand.style.width = (expand.parentNode.offsetWidth - 2) + 'px';
      expand.style.height = (expand.parentNode.offsetHeight - 2) + 'px';
    }
  };
  onresize();
  window.addEventListener('resize', onresize);

  // Inject Block Factory Main Workspace.
  var toolbox = document.getElementById('blockfactory_toolbox');
  BlockFactory.mainWorkspace = Blockly.inject('blockly',
      {collapse: false,
       toolbox: toolbox,
       media: '../../media/'});

  // Add tab handlers for switching between Block Factory and Block Exporter.
  this.addTabHandlers(this.tabMap);

  this.exporter.addChangeListenersToSelectorWorkspace();

  // Create the root block on Block Factory main workspace.
  if ('BlocklyStorage' in window && window.location.hash.length > 1) {
    BlocklyStorage.retrieveXml(window.location.hash.substring(1),
                               BlockFactory.mainWorkspace);
  } else {
    BlockFactory.showStarterBlock();
  }
  BlockFactory.mainWorkspace.clearUndo();

  // Add Block Factory event listeners.
  this.addBlockFactoryEventListeners();

  // Workspace Factory init
  this.initWorkspaceFactory_();
};

/**
 * Initialization for workspace factory tab.
 * @private
 */
AppController.prototype.initWorkspaceFactory_ = function() {
  // Disable category editing buttons until categories are created.
  document.getElementById('button_remove').disabled = true;
  document.getElementById('button_up').disabled = true;
  document.getElementById('button_down').disabled = true;
  document.getElementById('button_editCategory').disabled = true;
  document.getElementById('button_editShadow').disabled = true;

  this.initColorPicker_();
  this.addWorkspaceFactoryEventListeners_();
  this.assignWorkspaceFactoryClickHandlers_();

};

/**
 * Initialize the color picker in workspace factory.
 * @private
 */
AppController.prototype.initColorPicker_ = function() {
  // Array of Blockly category colors, variety of hues with saturation 45%
  // and value 65% as specified in Blockly Developer documentation:
  // https://developers.google.com/blockly/guides/create-custom-blocks/define-blocks
  var colors = ['#A65C5C',
      '#A6635C',
      '#A66A5C',
      '#A6725C',
      '#A6795C',
      '#A6815C',
      '#A6885C',
      '#A6905C',
      '#A6975C',
      '#A69F5C',
      '#A6A65C',
      '#9FA65C',
      '#97A65C',
      '#90A65C',
      '#88A65C',
      '#81A65C',
      '#79A65C',
      '#6FA65C',
      '#66A65C',
      '#5EA65C',
      '#5CA661',
      '#5CA668',
      '#5CA66F',
      '#5CA677',
      '#5CA67E',
      '#5CA686',
      '#5CA68D',
      '#5CA695',
      '#5CA69C',
      '#5CA6A4',
      '#5CA1A6',
      '#5C9AA6',
      '#5C92A6',
      '#5C8BA6',
      '#5C83A6',
      '#5C7CA6',
      '#5C74A6',
      '#5C6AA6',
      '#5C61A6',
      '#5E5CA6',
      '#665CA6',
      '#6D5CA6',
      '#745CA6',
      '#7C5CA6',
      '#835CA6',
      '#8B5CA6',
      '#925CA6',
      '#9A5CA6',
      '#A15CA6',
      '#A65CA4',
      '#A65C9C',
      '#A65C95',
      '#A65C8D',
      '#A65C86',
      '#A65C7E',
      '#A65C77',
      '#A65C6F',
      '#A65C66',
      '#A65C61',
      '#A65C5E'];

  // Create color picker with specific set of Blockly colors.
  var colorPicker = new goog.ui.ColorPicker();
  colorPicker.setColors(colors);

  // Create and render the popup color picker and attach to button.
  var popupPicker = new goog.ui.PopupColorPicker(null, colorPicker);
  popupPicker.render();
  popupPicker.attach(document.getElementById('dropdown_color'));
  popupPicker.setFocusable(true);
  goog.events.listen(popupPicker, 'change', function(e) {
    controller.changeSelectedCategoryColor(popupPicker.getSelectedColor());
    document.getElementById('dropdownDiv_editCategory').classList.remove
        ("show");
  });
};

/**
 * Assign click handlers for workspace factory.
 * @private
 */
AppController.prototype.assignWorkspaceFactoryClickHandlers_ = function() {
  var controller = this.workspaceFactoryController;
  document.getElementById('button_add').addEventListener
      ('click',
      function() {
        document.getElementById('dropdownDiv_add').classList.toggle("show");
      });

  document.getElementById('dropdown_newCategory').addEventListener
      ('click',
      function() {
        controller.addCategory();
        document.getElementById('dropdownDiv_add').classList.remove("show");
      });

  document.getElementById('dropdown_loadCategory').addEventListener
      ('click',
      function() {
        controller.loadCategory();
        document.getElementById('dropdownDiv_add').classList.remove("show");
      });

  document.getElementById('dropdown_separator').addEventListener
      ('click',
      function() {
        controller.addSeparator();
        document.getElementById('dropdownDiv_add').classList.remove("show");
      });

  document.getElementById('button_remove').addEventListener
      ('click',
      function() {
        controller.removeElement();
      });

  document.getElementById('button_export').addEventListener
      ('click',
      function() {
        controller.exportConfig();
      });

  document.getElementById('button_print').addEventListener
      ('click',
      function() {
        controller.printConfig();
      });

  document.getElementById('button_up').addEventListener
      ('click',
      function() {
        controller.moveElement(-1);
      });

  document.getElementById('button_down').addEventListener
      ('click',
      function() {
        controller.moveElement(1);
      });

  document.getElementById('button_editCategory').addEventListener
      ('click',
      function() {
        document.getElementById('dropdownDiv_editCategory').classList.
        toggle("show");
      });

  document.getElementById('button_editShadow').addEventListener
      ('click',
      function() {
        if (Blockly.selected) {
          // Can only edit blocks when a block is selected.

          if (!controller.isUserGenShadowBlock(Blockly.selected.id) &&
              Blockly.selected.getSurroundParent() != null) {
            // If a block is selected that could be a valid shadow block (not a
            // shadow block, has a surrounding parent), let the user make it a
            // shadow block. Use toggle instead of add so that the user can
            // click the button again to make the dropdown disappear without
            // clicking one of the options.
            document.getElementById('dropdownDiv_editShadowRemove').classList.
                remove("show");
            document.getElementById('dropdownDiv_editShadowAdd').classList.
                toggle("show");
          } else {
            // If the block is a shadow block, let the user make it a normal
            // block.
            document.getElementById('dropdownDiv_editShadowAdd').classList.
                remove("show");
            document.getElementById('dropdownDiv_editShadowRemove').classList.
                toggle("show");
          }
        }
      });

  document.getElementById('dropdown_name').addEventListener
      ('click',
      function() {
        controller.changeCategoryName();
        document.getElementById('dropdownDiv_editCategory').classList.
            remove("show");
      });

  document.getElementById('input_import').addEventListener
      ('change',
      function(event) {
        controller.importFile(event.target.files[0]);
      });

  document.getElementById('button_clear').addEventListener
      ('click',
      function() {
        controller.clear();
      });

  document.getElementById('dropdown_addShadow').addEventListener
      ('click',
      function() {
        controller.addShadow();
        document.getElementById('dropdownDiv_editShadowAdd').classList.
            remove("show");
      });

  document.getElementById('dropdown_removeShadow').addEventListener
      ('click',
      function() {
        controller.removeShadow();
        document.getElementById('dropdownDiv_editShadowRemove').classList.
            remove("show");
        // If turning invalid shadow block back to normal block, remove
        // warning and disable block editing privileges.
        Blockly.selected.setWarningText(null);
        if (!Blockly.selected.getSurroundParent()) {
          document.getElementById('button_editShadow').disabled = true;
        }
      });
};

/**
 * Add event listeners for worokspace factory.
 * @private
 */
AppController.prototype.addWorkspaceFactoryEventListeners_ = function() {
  var controller = this.workspaceFactoryController;
  // Use up and down arrow keys to move categories.
  // TODO(evd2014): When merge with next CL for editing preloaded blocks, make
  // sure mode is toolbox.
  window.addEventListener('keydown', function(e) {
    if (this.selectedTab != 'WORKSPACE_FACTORY' && e.keyCode == 38) {
      // Arrow up.
      controller.moveElement(-1);
    } else if (this.selectedTab != 'WORKSPACE_FACTORY' && e.keyCode == 40) {
      // Arrow down.
      controller.moveElement(1);
    }
  });

  // Add change listeners for toolbox workspace in workspace factory.
  controller.toolboxWorkspace.addChangeListener(
    function(e) {
    // Listen for Blockly move and delete events to update preview.
    // Not listening for Blockly create events because causes the user to drop
    // blocks when dragging them into workspace. Could cause problems if ever
    // load blocks into workspace directly without calling updatePreview.
    if (e.type == Blockly.Events.MOVE || e.type == Blockly.Events.DELETE) {
      controller.updatePreview();
    }

    // Listen for Blockly UI events to correctly enable the "Edit Block"
    // button. Only enable "Edit Block" when a block is selected and it has a
    // surrounding parent, meaning it is nested in another block (blocks that
    // are not nested in parents cannot be shadow blocks).
    if (e.type == Blockly.Events.MOVE || (e.type == Blockly.Events.UI &&
        e.element == 'selected')) {
      var selected = Blockly.selected;

      if (selected != null && selected.getSurroundParent() != null) {

        // A valid shadow block is selected. Enable block editing and remove
        // warnings.
        document.getElementById('button_editShadow').disabled = false;
        Blockly.selected.setWarningText(null);
      } else {
        if (selected != null &&
            controller.isUserGenShadowBlock(selected.id)) {

        // Provide warning if shadow block is moved and is no longer a valid
        // shadow block.
          Blockly.selected.setWarningText('Shadow blocks must be nested' +
              ' inside other blocks to be displayed.');

          // Give editing options so that the user can make an invalid shadow
          // block a normal block.
          document.getElementById('button_editShadow').disabled = false;
        } else {

          // No block selected that is a shadow block or could be a valid
          // shadow block.
          // Disable block editing.
          document.getElementById('button_editShadow').disabled = true;
          document.getElementById('dropdownDiv_editShadowRemove').classList.
              remove("show");
          document.getElementById('dropdownDiv_editShadowAdd').classList.
              remove("show");
        }
      }
    }

    // Convert actual shadow blocks added from the toolbox to user-generated
    // shadow blocks.
    if (e.type == Blockly.Events.CREATE) {
      controller.convertShadowBlocks();
    }
  });
};
