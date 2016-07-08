//listen_if block executes a set of statements if the user says a specified word (entered in a text field)
Blockly.Blocks['listen_if'] = {
  init: function() {
    this.appendValueInput("WORD")
        .setCheck("String")
        .appendField("if you say");
    this.appendStatementInput("DO")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(0);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['listen_if'] = function(block) {
    var text_word = Blockly.JavaScript.valueToCode(block, 'WORD', Blockly.JavaScript.ORDER_ATOMIC);
    var statements_do = Blockly.JavaScript.statementToCode(block, 'DO');
    addRecognizableWord(text_word);
    return 'if (listen_branch('+formatText(text_word)+')) {\n' + statements_do + '}\n';
};

//listen_bool returns a boolean value, true if the user says a specified word and false otherwise
Blockly.Blocks['listen_bool'] = {
  init: function() {
    this.appendValueInput("WORD")
        .setCheck("String")
        .appendField("you say");
    this.setOutput(true, null);
    this.setColour(0);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['listen_bool'] = function(block) {
    var text_word = Blockly.JavaScript.valueToCode(block, 'WORD', Blockly.JavaScript.ORDER_ATOMIC);
    addRecognizableWord(text_word);
    window.console.log(text_word + " "+ formatText(text_word));
    var code = 'listen_branch('+formatText(text_word)+')';
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

//listen_text returns a String containing what the user said
Blockly.Blocks['listen_text'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("what you say");
    this.setOutput(true, "String");
    this.setColour(0);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['listen_text'] = function(block) {
  var code = 'listen_text()';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

//display_img displays an image in a section of the page using the provided link
Blockly.Blocks['display_img'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("display image at")
        .appendField(new Blockly.FieldTextInput("this link"), "IMG_SRC");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['display_img'] = function(block) {
  var text_img_src = block.getFieldValue('IMG_SRC');
  var code = 'displayImage('+Blockly.JavaScript.quote_(text_img_src)+');\n';
  return code;
};

//display_pause pauses execution for TIME (given in miliseconds)
Blockly.Blocks['display_pause'] = {
  init: function() {
    this.appendValueInput("TIME")
        .setCheck("Number")
        .appendField("pause for");
    this.appendDummyInput()
        .appendField("seconds");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['display_pause'] = function(block) {
  var value_time = Blockly.JavaScript.valueToCode(block, 'TIME', Blockly.JavaScript.ORDER_ATOMIC);
  value_time *= 1000;
  var code = 'pause('+value_time+');\n';
  return code;
};

//updates the textArea div by either replacing or appending to current text.
Blockly.Blocks['display_update_text'] = {
  init: function() {
    this.appendValueInput("UPDATE_TEXT")
        .setCheck("String")
        .appendField("write");
    this.appendDummyInput()
        .appendField("by")
        .appendField(new Blockly.FieldDropdown([["replacing old text", "REPLACE"], ["adding to old text", "APPEND"]]), "WRITETYPE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};


Blockly.JavaScript['display_update_text'] = function(block) {
  var value_update_text = Blockly.JavaScript.valueToCode(block, 'UPDATE_TEXT', Blockly.JavaScript.ORDER_ATOMIC);
  var dropdown_name = block.getFieldValue('WRITETYPE');
  var code = 'if(' + Blockly.JavaScript.quote_(dropdown_name) + ' == "REPLACE"){\n\
      clearText("textArea");\n\
}\n\
appendText("p", '+ value_update_text + ',"textArea");\n';
  return code;
};

//clears the textArea div
Blockly.Blocks['display_clear_text'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("clear all text");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['display_clear_text'] = function(block) {
  var code = 'clearText("textArea");\n';
  return code;
};

//speech_speak block links to a String input and says the String aloud upon execution
Blockly.Blocks['speech_speak'] = {
  init: function() {
    this.appendValueInput("TO_SAY")
        .setCheck("String")
        .appendField("say");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(30);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['speech_speak'] = function(block) {
  var value_to_say = Blockly.JavaScript.valueToCode(block, 'TO_SAY', Blockly.JavaScript.ORDER_ATOMIC);
  var code;
  if (value_to_say !== '' && value_to_say !== null){
    code = 'globalSay(' + value_to_say + ');\n';
  }  
  else{
    code = '\n';
  }
  return code;
};

/** helper function for the 'speech_set_voice' block;
 * @param {!Array.<SpeechSynthesisVoice>} the available voices
 * @return {!Array.<!Array.<string>>} the dropdown options 
 */
var getVoicesForBlock = function(voices){
  var dropdown = [];
  for (i = 0; i < voices.length; i++){
    var voice = [voices[i].name, i.toString()];
    dropdown.push(voice);
  };
  return dropdown;
}


/** the voice list is loaded async to the page. An onvoiceschanged event is fired when they are loaded.
 *  http://stackoverflow.com/questions/21513706/getting-the-list-of-voices-in-speechsynthesis-of-chrome-web-speech-api
 */
var voices; 
 // wait on voices to be loaded before fetching list
window.speechSynthesis.onvoiceschanged = function(){
    //voices becomes {!Array.<SpeechSynthesisVoice>}
    voices = window.speechSynthesis.getVoices();
    Blockly.Blocks['speech_set_voice'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("set voice to")
            .appendField(new Blockly.FieldDropdown(getVoicesForBlock(voices)), "VOICES");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(30);
        this.setTooltip('');
        this.setHelpUrl('http://www.example.com/');
      }
    };
};

//set voice based on user's dropdown choice
//default is Alex
Blockly.JavaScript['speech_set_voice'] = function(block) {
  var dropdown_name = block.getFieldValue('VOICES');
  // var newVoice = voices[parseInt(dropdown_name)];
  var voiceIndex = parseInt(dropdown_name);
  var code = 'voices = getVoices();\n\
    var voiceIndex = ' + voiceIndex + ';\n\
    var newVoice = voices[voiceIndex];\n\
    setVoice(voiceIndex);';
  return code;
};

//set volume of speech
Blockly.Blocks['speech_set_volume'] = {
  init: function() {
    this.appendValueInput("VOLUME")
        .setCheck("Number")
        .appendField("set volume to (between 0 and 1)");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(30);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['speech_set_volume'] = function(block) {
  var value_volume = Blockly.JavaScript.valueToCode(block, 'VOLUME', Blockly.JavaScript.ORDER_ATOMIC);
  var code = '';
  if (value_volume >= 0 && value_volume <= 1)
    code = 'setVolume('+ value_volume+');\n';
  return code;
};

//set rate of speech
Blockly.Blocks['speech_set_rate'] = {
  init: function() {
    this.appendValueInput("RATE")
        .setCheck("Number")
        .appendField("set speech rate to (between .1 and 10)");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(30);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['speech_set_rate'] = function(block) {
  var value_rate = Blockly.JavaScript.valueToCode(block, 'RATE', Blockly.JavaScript.ORDER_ATOMIC);
  var code = '';
  if (value_rate >= .1 && value_rate <= 10)
    code = 'setRate('+ value_rate+');\n';
  return code;
};

Blockly.Blocks['speech_say_and_write'] = {
  init: function() {
    this.appendValueInput("TEXT")
        .setCheck("String")
        .appendField("say and write");
    this.appendDummyInput()
        .appendField("by")
        .appendField(new Blockly.FieldDropdown([["replacing old text", "REPLACE"], ["adding to old text", "APPEND"]]), "WRITE_TYPE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(30);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.JavaScript['speech_say_and_write'] = function(block) {
  var value_update_text = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_ATOMIC);
  var dropdown_write_type = block.getFieldValue('WRITE_TYPE');
    var code = 'if(' + Blockly.JavaScript.quote_(dropdown_write_type) + ' == "REPLACE"){\n\
      clearText("textArea");\n\
    }\n\
    appendText("p", '+ value_update_text + ',"textArea");\n\
    globalSay('+ value_update_text+');\n';
  return code;
};