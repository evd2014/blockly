/**
 * @fileoverview Generates the configuration xml used to update the preview
 * workspace or print to the console or downlaod to a file. Leverages
 * Blockly.Xml and depends on information in the model and in toolboxWorkspace,
 * by holding references to them.
 *
 * @author Emma Dauterman (edauterman)
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
 * Adaped from workspaceToDom, encodes workspace for a particular category
 * in an xml dom
 *
 * @param {!Element} xmlDom Tree of XML elements to be appended to.
 * @param {!Array.<!Blockly.Block>} topBlocks top level blocks to add to xmlDom
 */
FactoryGenerator.prototype.categoryWorkspaceToDom = function(xmlDom, blocks) {
  for (var i=0, block; block=blocks[i]; i++) {
    var blockChild = Blockly.Xml.blockToDom(block);
    blockChild.removeAttribute('id');
    xmlDom.appendChild(blockChild);
  }
};

/**
 * Generates the xml for the toolbox or flyout. If there is only a flyout,
 * only the current blocks are needed, and these are included without
 * a category. If there are categories, then each category is briefly loaded
 * and the top blocks are used to generate the xml for the flyout for that
 * category.
 * This was changed to load each category instead of just using the stored
 * top blocks because blocks connected to the top blocks were lost if the
 * whole workspace was not loaded (including shadow blocks, block groups, etc.).
 *
 * @return {!Element} XML element representing toolbox or flyout corresponding
 * to toolbox workspace.
 */
FactoryGenerator.prototype.generateConfigXml = function() {
  var xmlDom = goog.dom.createDom('xml',
      {
        'id' : 'toolbox',
        'style' : 'display:none'
      });
  if (!this.model.getSelectedId()) {
    FactoryGenerator.categoryWorkspaceToDom(xmlDom,
        toolboxWorkspace.getTopBlocks());
  }
  else {
    // Capture any changes made by user before generating xml.
    this.model.captureState(this.model.getSelectedId(), this.toolboxWorkspace);
    var categoryList = this.model.getCategoryList();
    for (var i=0; i<categoryList.length; i++) {
      var category = categoryList[i];
      var categoryElement = goog.dom.createDom('category');
      categoryElement.setAttribute('name',category);
      this.toolboxWorkspace.clear();
      Blockly.Xml.domToWorkspace(this.model.getXmlByName(category),
          this.toolboxWorkspace);
      this.categoryWorkspaceToDom(categoryElement,
          this.toolboxWorkspace.getTopBlocks());
      xmlDom.appendChild(categoryElement);
    }
  }
  this.toolboxWorkspace.clear();
  Blockly.Xml.domToWorkspace(this.model.getXmlById(this.model.getSelectedId()),
      this.toolboxWorkspace);
  return xmlDom;
 }
