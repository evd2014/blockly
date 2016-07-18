/**
 * @fileoverview Generates the configuration xml used to update the preview
 * workspace or print to the console or downlaod to a file. Leverages
 * Blockly.Xml and depends on information in the model and in toolboxWorkspace.
 *
 * @author Emma Dauterman (edauterman)
 */

/**
 * namespace for workspace factory xml generation code
 * @namespace FactoryGenerator
 */
FactoryGenerator = {};

/**
 * Adaped from workspaceToDom, encodes workspace for a particular category
 * in an xml dom
 *
 * @param {!Element} xmlDom Tree of XML elements to be appended to.
 * @param {!Array.<!Blockly.Block>} topBlocks top level blocks to add to xmlDom
 */
FactoryGenerator.categoryWorkspaceToDom = function(xmlDom, blocks) {
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
FactoryGenerator.generateConfigXml = function() {
  var xmlDom = goog.dom.createDom('xml',
      {
        'id' : 'toolbox',
        'style' : 'display:none'
      });
  if (!model.getSelectedId()) {
    FactoryGenerator.categoryWorkspaceToDom(xmlDom,
        toolboxWorkspace.getTopBlocks());
  }
  else {
    // Capture any changes made by user before generating xml.
    model.captureState(model.getSelectedId());
    var categoryList = model.getCategoryList();
    for (var i=0; i<categoryList.length; i++) {
      var category = categoryList[i];
      var categoryElement = goog.dom.createDom('category');
      categoryElement.setAttribute('name',category);
      toolboxWorkspace.clear();
      Blockly.Xml.domToWorkspace(model.getXmlByName(category),
          toolboxWorkspace);
      FactoryGenerator.categoryWorkspaceToDom(categoryElement,
          toolboxWorkspace.getTopBlocks());
      xmlDom.appendChild(categoryElement);
    }
  }
  toolboxWorkspace.clear();
  Blockly.Xml.domToWorkspace(model.getXmlById(model.getSelectedId()),
      toolboxWorkspace);
  return xmlDom;
 }
