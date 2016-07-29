/**
 * @fileoverview Generates the configuration xml used to update the preview
 * workspace or print to the console or download to a file. Leverages
 * Blockly.Xml and depends on information in the model and in toolboxWorkspace,
 * by holding references to them.
 *
 * @author Emma Dauterman (evd2014)
 */

/**
 * Class for a FactoryGenerator
 * @constructor
 */
FactoryGenerator = function(model, toolboxWorkspace) {
  this.model = model;
  this.toolboxWorkspace = toolboxWorkspace;
};

/**
 * Encodes workspace for a particular category in a XML DOM element. Very
 * similar to workspaceToDom, but doesn't capture IDs.
 *
 * @param {!Element} xmlDom Tree of XML elements to be appended to.
 * @param {!Array.<!Blockly.Block>} topBlocks top level blocks to add to xmlDom
 */
FactoryGenerator.prototype.categoryWorkspaceToDom = function(xmlDom, blocks) {
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
 * the user marked shadow blocks are set as real shadow blocks, and the top
 * blocks are used to generate the xml for the flyout for that category.
 *
 * @return {!Element} XML element representing toolbox or flyout corresponding
 * to toolbox workspace.
 */
FactoryGenerator.prototype.generateConfigXml = function() {
  // Create DOM for XML.
  var xmlDom = goog.dom.createDom('xml',
      {
        'id' : 'toolbox',
        'style' : 'display:none'
      });
  // If no categories, use XML directly from workspace
  if (!this.model.hasToolbox()) {
    // Save XML.
    var xml = Blockly.Xml.workspaceToDom(this.toolboxWorkspace);
    // Set user-generated shadow blocks as real shadow blocks.
    this.model.setShadowBlocks(this.toolboxWorkspace.getAllBlocks());
    // Generate XML.
    this.categoryWorkspaceToDom(xmlDom, this.toolboxWorkspace.getTopBlocks());
  }
  else {
    // Assert that selected != null
    if (!this.model.getSelected()) {
      throw new Error('Selected is null when there are categories');
    }
    // Capture any changes made by user before generating xml.
    this.model.saveCategoryInList(this.model.getSelected(),
        this.toolboxWorkspace);
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
        // Load that category to workspace, setting user-generated shadow blocks
        // as real shadow blocks..
        this.toolboxWorkspace.clear();
        Blockly.Xml.domToWorkspace(element.xml, this.toolboxWorkspace);
        this.model.setShadowBlocks(this.toolboxWorkspace.getAllBlocks());
        // Generate XML for that category, append to DOM for all XML.
        this.categoryWorkspaceToDom(categoryElement,
            this.toolboxWorkspace.getTopBlocks());
        xmlDom.appendChild(categoryElement);
      }
    }
  }
  // Load category user was working on, marking the shadow blocks to be shown
  // visually without being real shadow blocks (default for editing).
  this.toolboxWorkspace.clear();
  Blockly.Xml.domToWorkspace(xml, this.toolboxWorkspace);
  this.model.markShadowBlocks(this.toolboxWorkspace.getAllBlocks());
  return xmlDom;
 };
