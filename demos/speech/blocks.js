/**
 * @fileoverview Block configurations for all custom blocks using the Web
 * Speech API and updating the webpage using text and images from the user.
 * The generator functions for these blocks are defined in blockgenerators.js.
 *
 * @author edauterman, quacht
 */

Blockly.Blocks['listen_if'] = {
  /**
   * Block for listening if the user says a certain word, executing code
   */
  init: function() {
    this.appendValueInput('WORD')
        .setCheck('String')
        .appendField('if you say');
    this.appendStatementInput('DO')
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(0);
  }
};

Blockly.Blocks['listen_bool'] = {
  /**
   * Block for returning true if user says a certain word, false otherwise
   */
  init: function() {
    this.appendValueInput('WORD')
        .setCheck('String')
        .appendField('you say');
    this.setOutput(true, null);
    this.setColour(0);
  }
};

Blockly.Blocks['listen_text'] = {
  /**
   * Block for returning what the user says
   */
  init: function() {
    this.appendDummyInput()
        .appendField('what you say');
    this.setOutput(true, 'String');
    this.setColour(0);
  }
};

Blockly.Blocks['display_img'] = {
  /**
   * Block for displaying an image at a URL
   */
  init: function() {
    this.appendDummyInput('')
        .appendField('display image at')
        .appendField(new Blockly.FieldTextInput('this link'), 'IMG_SRC');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
  }
};

Blockly.Blocks['display_pause'] = {
  /**
   * Block for pausing for a certain number of seconds
   */
  init: function() {
    this.appendValueInput('TIME')
        .setCheck('Number')
        .appendField('pause for');
    this.appendDummyInput()
        .appendField('seconds');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
  }
};

//const for options to replace or append text
const writeOpt = [['replacing old text', 'REPLACE'],
  ['adding to old text', 'APPEND']];

Blockly.Blocks['display_update_text'] = {
  /**
   * Block to update the text shown on the screen
   */
  init: function() {
    this.appendValueInput('UPDATE_TEXT')
        .setCheck('String')
        .appendField('write');
    this.appendDummyInput()
        .appendField('by')
        .appendField(new Blockly.FieldDropdown(writeOpt), 'WRITETYPE');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
  }
};

Blockly.Blocks['display_clear_text'] = {
  /**
   * Block for clearing all the text on the screen
   */
  init: function() {
    this.appendDummyInput()
        .appendField('clear all text');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
  }
};

Blockly.Blocks['speech_speak'] = {
  /**
   * Block for speaking certain text
   */
  init: function() {
    this.appendValueInput('TO_SAY')
        .setCheck('String')
        .appendField('say');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(30);
  }
};

var Voice = {};
// todo
window.speechSynthesis.getVoices();

var voices;
/**
 * Helper function for the 'speech_set_voice' block;
 *
 * @return {!Array.<!Array.<string>>} dropdown - the dropdown options
 */
Voice.getVoicesForBlock = function() {
  voices = window.speechSynthesis.getVoices();
  var dropdown = [];
  for (var i = 0; i < voices.length; i++) {
    var voice = [voices[i].name, i.toString()];
    dropdown.push(voice);
  }
  return dropdown;
};


/**
 * The voice list is loaded async to the page in Chrome. An onvoiceschanged
 * event is fired when they are loaded.
 * http://stackoverflow.com/questions/21513706/getting-the-list-of-voices-in-speechsynthesis-of-chrome-web-speech-api
 */

Blockly.Blocks['speech_set_voice'] = {
  init: function() {
      this.appendDummyInput()
          .appendField('set voice to')
          .appendField(
            new Blockly.FieldDropdown(Voice.getVoicesForBlock()), 'VOICES');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(30);
    }
};

Blockly.Blocks['speech_set_volume'] = {
  /**
   * Block for setting the volume of speech
   */
  init: function() {
    this.appendValueInput('VOLUME')
        .setCheck('Number')
        .appendField('set volume to (between 0 and 1)');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(30);
  }
};

Blockly.Blocks['speech_set_rate'] = {
  /**
   * Block for setting the rate of speech
   */
  init: function() {
    this.appendValueInput('RATE')
        .setCheck('Number')
        .appendField('set speech rate to (between .1 and 10)');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(30);
  }
};

Blockly.Blocks['speech_say_and_write'] = {
  /**
   * Block for speaking and writing text
   */
  init: function() {
    this.appendValueInput('TEXT')
        .setCheck('String')
        .appendField('say and write');
    this.appendDummyInput()
        .appendField('by')
        .appendField(new Blockly.FieldDropdown(writeOpt), 'WRITE_TYPE');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(30);
  }
};
