/**
 * @fileoverview Generates the configuration xml used to update the preview
 * workspace or print to the console or download to a file. Leverages
 * Blockly.Xml and depends on information in the model (holds a reference).
 * Depends on a hidden workspace created in the generator to load saved XML in
 * order to generate toolbox XML.
 *
 * @author Emma Dauterman (evd2014)
 */

/**
 * Class for a FactoryGenerator
 * @constructor
 */
FactoryGenerator = function(model) {
  // Model to share information about categories and shadow blocks.
  this.model = model;
  // Create hidden workspace to load saved XML to generate toolbox XML.
  var hiddenBlocks = document.createElement('div');
  hiddenBlocks.id = 'hidden_blocks';
  document.body.appendChild(hiddenBlocks);
  hiddenBlocks.style.display = 'none';
  this.hiddenWorkspace = Blockly.inject('hidden_blocks');
};

/**
 * Encodes workspace for a particular category in a XML DOM element. Very
 * similar to workspaceToDom, but doesn't capture IDs. Uses the top-level
 * blocks loaded in hiddenWorkspace.
 *
 * @param {!Element} xmlDom Tree of XML elements to be appended to.
 */
FactoryGenerator.prototype.categoryWorkspaceToDom = function(xmlDom) {
  var blocks = this.hiddenWorkspace.getTopBlocks();
  for (var i = 0, block; block = blocks[i]; i++) {
    var blockChild = Blockly.Xml.blockToDom(block);
    blockChild.removeAttribute('id');
    xmlDom.appendChild(blockChild);
  }
};

/**
 * Generates the xml for the toolbox or flyout. If there is only a flyout,
 * only the current blocks are needed, and these are included without
 * a category. If there are categories, then each category is briefly loaded,
 * the user-generated shadow blocks are set as real shadow blocks, and the top
 * blocks are used to generate the xml for the flyout for that category.
 *
 * @param {!Blockly.workspace} toolboxWorkspace Toolbox editing workspace where
 * blocks are added by user to be part of the toolbox.
 * @return {!Element} XML element representing toolbox or flyout corresponding
 * to toolbox workspace.
 */
FactoryGenerator.prototype.generateConfigXml = function(toolboxWorkspace) {
  // Create DOM for XML.
  var xmlDom = goog.dom.createDom('xml',
      {
        'id' : 'toolbox',
        'style' : 'display:none'
      });
  // If no categories, use XML directly from workspace
  if (!this.model.hasToolbox()) {
    // Load current XML to hidden workspace.
    var xml = Blockly.Xml.workspaceToDom(toolboxWorkspace);
    this.hiddenWorkspace.clear();
    Blockly.Xml.domToWorkspace(xml, this.hiddenWorkspace);
    // Set user-generated shadow blocks as real shadow blocks.
    this.setShadowBlocks();
    // Generate XML from hidden workspace.
    this.categoryWorkspaceToDom(xmlDom);
  }
  else {
    // Assert that selected != null
    if (!this.model.getSelected()) {
      throw new Error('Selected is null when the toolbox is empty.');
    }
    // Capture any changes made by user before generating xml.
    this.model.saveCategoryInList(this.model.getSelected(),
        toolboxWorkspace);
    var xml = this.model.getSelectedXml();
    var toolboxList = this.model.getToolboxList();
    // Iterate through each category to generate XML for each. Load each
    // category to make sure that all the blocks that are not top blocks are
    // also captured as block groups in the flyout.
    for (var i = 0; i < toolboxList.length; i++) {
      // Create category DOM element.
      var element = toolboxList[i];
      if (element.type == ListElement.SEPARATOR) {
        var sepElement = goog.dom.createDom('sep');
        xmlDom.appendChild(sepElement);
      } else {
        var categoryElement = goog.dom.createDom('category');
        categoryElement.setAttribute('name', element.name);
        // Add a colour attribute if one exists.
        if (element.color != null) {
          categoryElement.setAttribute('colour', element.color);
        }
        // Add a custom attribute if one exists.
        if (element.custom != null) {
          categoryElement.setAttribute('custom', element.custom);
        }
        // Load that category to hidden workspace, setting user-generated shadow
        // blocks as real shadow blocks..
        this.hiddenWorkspace.clear();
        Blockly.Xml.domToWorkspace(element.xml, this.hiddenWorkspace);
        this.setShadowBlocks();
        // Generate XML for that category, append to DOM for all XML.
        this.categoryWorkspaceToDom(categoryElement);
        xmlDom.appendChild(categoryElement);
      }
    }
  }
  return xmlDom;
 };

/**
 * Sets the user-generated shadow blocks loaded into hiddenWorkspace to be
 * actual shadow blocks. This is done so that blockToDom records them as
 * shadow blocks instead of regular blocks.
 *
 */
FactoryGenerator.prototype.setShadowBlocks = function() {
  var blocks = this.hiddenWorkspace.getAllBlocks();
  for (var i = 0; i < blocks.length; i++) {
    if (this.model.isShadowBlock(blocks[i].id)) {
      blocks[i].setShadow(true);
    }
  }
};
