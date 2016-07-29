FactoryUtils = {};

FactoryUtils.markShadowBlock = function(block) {
  // var hexColour = block.getColour();
  // var rgb = goog.color.hexToRgb(hexColour);
  // rgb = goog.color.lighten(rgb, 0.6)
  // window.console.log(rgb);
  // block.setColour(rgb);
  block.setColour('#000000');
};

FactoryUtils.setShadowBlock = function(block) {
    block.setShadow(true);
}
