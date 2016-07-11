/**
 * @fileoverview Block generator functions for custom blocks using the Web
 * Speech API and updating the page using text and images.
 *
 * @author edauterman, quacht
 */

/**
 * listen_if block executes a set of statements if the user says a specified
 * word (entered in a text field)
 */
Blockly.JavaScript['listen_if'] = function(block) {
    var textWord = Blockly.JavaScript.valueToCode(block, 'WORD',
      Blockly.JavaScript.ORDER_ATOMIC);
    var statements = Blockly.JavaScript.statementToCode(block, 'DO');
    addRecognizableWord(textWord);
    return 'if (listen_branch('+formatText(textWord)+')) {\n' +
      statements + '}\n';
};

/**
 * listen_bool returns a boolean value, true if the user says a specified word
 * and false otherwise
 */
Blockly.JavaScript['listen_bool'] = function(block) {
    var textWord = Blockly.JavaScript.valueToCode(block, 'WORD',
    	Blockly.JavaScript.ORDER_ATOMIC);
    addRecognizableWord(textWord);
    window.console.log(textWord + ' ' + formatText(textWord));
    var code = 'listen_branch('+formatText(textWord)+')';
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

/**
 * listen_text returns a String containing what the user said
 */
Blockly.JavaScript['listen_text'] = function(block) {
  var code = 'listen_text()';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

/**
 * display_img displays an image in a section of the page using the provided
 * link
 */
Blockly.JavaScript['display_img'] = function(block) {
  var textImgSrc = block.getFieldValue('IMG_SRC');
  var code = 'displayImage('+Blockly.JavaScript.quote_(textImgSrc)+');\n';
  return code;
};

/**
 * display_pause pauses execution for TIME (given in seconds)
 */
Blockly.JavaScript['display_pause'] = function(block) {
  var valueTime = Blockly.JavaScript.valueToCode(block, 'TIME',
  	Blockly.JavaScript.ORDER_ATOMIC);
  valueTime *= 1000;	//milliseconds to seconds
  var code = 'pause('+valueTime+');\n';
  return code;
};

/**
 * Updates the textArea div by either replacing or appending to current text.
 */
Blockly.JavaScript['display_update_text'] = function(block) {
  var valueUpdateText = Blockly.JavaScript.valueToCode(block, 'UPDATE_TEXT',
  	Blockly.JavaScript.ORDER_ATOMIC);
  var dropdownName = block.getFieldValue('WRITETYPE');
  var code = 'if(' + Blockly.JavaScript.quote_(dropdownName) + ' == "REPLACE")\
  	{\n\
      clearText("textArea");\n\
	}\n\
	appendText("p", '+ valueUpdateText + ',"textArea");\n';
  return code;
};

/**
 * Clears the textArea div
 */

Blockly.JavaScript['display_clear_text'] = function() {
  var code = 'clearText("textArea");\n';
  return code;
};

/**
 * speech_speak block links to a String input and says the String aloud upon
 * execution
 */
Blockly.JavaScript['speech_speak'] = function(block) {
  var valueToSay = Blockly.JavaScript.valueToCode(block, 'TO_SAY',
  	Blockly.JavaScript.ORDER_ATOMIC);
  var code;
  if (valueToSay !== '' && valueToSay !== null) {
    code = 'globalSay(' + valueToSay + ');\n';
  } else {
    code = '\n';
  }
  return code;
};

/**
 * Set voice based on user's dropdown choice
 * Default is Alex
 */
Blockly.JavaScript['speech_set_voice'] = function(block) {
  var dropdownName = block.getFieldValue('VOICES');
  var voiceIndex = parseInt(dropdownName);
  var code = 'setVoice('+voiceIndex+');\n';
  return code;
};

/**
 * Set volume of speech
 */

Blockly.JavaScript['speech_set_volume'] = function(block) {
  var valueVolume = Blockly.JavaScript.valueToCode(
    block, 'VOLUME', Blockly.JavaScript.ORDER_ATOMIC);
  var code = '';
  if (valueVolume >= 0 && valueVolume <= 1) {
    code = 'setVolume('+ valueVolume+');\n';
  }
  return code;
};

/**
 * Set rate of speech
 */

 Blockly.JavaScript['speech_set_rate'] = function(block) {
  var valueRate = Blockly.JavaScript.valueToCode(
    block, 'RATE', Blockly.JavaScript.ORDER_ATOMIC);
  var code = '';
  if (valueRate >= .1 && valueRate <= 10) {
    code = 'setRate('+ valueRate+');\n';
  }
  return code;
};

/**
 * Speaks and writes to screen text
 */
Blockly.JavaScript['speech_say_and_write'] = function(block) {
  var valueUpdateText = Blockly.JavaScript.valueToCode(
    block, 'TEXT', Blockly.JavaScript.ORDER_ATOMIC);
  var dropdownWriteType = block.getFieldValue('WRITE_TYPE');
  var code = 'if(' + Blockly.JavaScript.quote_(dropdownWriteType) + ' ==\
     "REPLACE") {\n\
      clearText("textArea");\n\
    }\n\
    appendText("p", '+ valueUpdateText + ',"textArea");\n\
    globalSay('+ valueUpdateText+');\n';
  return code;
};
