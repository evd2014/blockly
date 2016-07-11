/**
 * @fileoverview initializes the speech recongition and synthesis objects,
 * defines helper functions for the demo and  functions to run custom
 * blocks' code using JS Interpreter. Much of this exists in the form of wrapper
 * functions. This file depends on the index.html (some functions edit the DOM),
 * blocks.js (where the blocks' init functions and the global voices
 * variable is defined), and blockgenerators.js (where the block generate code
 * is defined).
 *
 * @author edauterman, quacht
 */

'use strict';
//namespace
var speech = {};
//keeps track of all the words that the recognizer should listen for
speech.recognizableWords = [];

if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)){
  alert("Speech recognition and speech synthesis not supported. Please use \
    Chrome to run this demo.");
}

speech.SpeechRecognition = webkitSpeechRecognition;
speech.SpeechGrammarList = webkitSpeechGrammarList;
speech.SpeechRecognitionEvent = webkitSpeechRecognitionEvent;

//allows for portability across different browsers
// TODO(quacht): waiting to hear back from  Neil about why the implementation below is
//causing issues.
// speech.SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
// speech.SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
// speech.SpeechRecognitionEvent = SpeechRecognitionEvent ||
//     webkitSpeechRecognitionEvent;

//global instance whose attributes may be edited in order to affect speech
//output
speech.msg = new SpeechSynthesisUtterance();

/**
 * Associated with the "Show Javascript button", outputs the code in an alert
 * window
 */
speech.showCode = function() {
  Blockly.JavaScript.INFINITE_LOOP_TRAP = null;
  var code = Blockly.JavaScript.workspaceToCode(workspace);
  alert(code);
};

/**
 * Used for logging messages from within the JS Interpreter. Prints it to the
 * logging area and the console.
 *
 * @param {Interpreter} myInterpreter - The interpreter that is initialized and
 * running the code.
 * @param {string} message - The message that will be printed to the logging
 * area and console
 */
speech.logMessage = function(myInterpreter, message) {
  myInterpreter.createPrimitive(document.getElementById('logText').innerHTML =
      '<code>'+message+'</code>');
  window.console.log(message);
};

/**
 * Taken from JS Interpreter example.
 * Runs the JSInterpreter such that asynchronous functions may work properly.
 *
 * @param {Interpreter} myInterpreter The interpreter that is initialized and
 * will run the code.
 */
speech.runButton = function(myInterpreter) {
  if (myInterpreter.run()) {
    // Ran until an async call.  Give this call a chance to run. Then start
    //running again later.
    setTimeout(speech.runButton, 10, myInterpreter);
  }
};

/**
 * Generate JavaScript code and run it using the JS Interpreter, prints code to
 * console for debugging. Defines wrappers (synchronously and asynchronously) to
 * handle certain blocks that cannot be handled by the JS Interpreter
 * internally.
 * NOTE: If the wrapper functions are moved outside of runCode, then
 * myInterpreter is not in scope. It needs to be a local because it needs to be
 * recreated each time to allow for changes to code, and myInterpreter can't be
 * passed as an argument because the order and type of arguments is defined by
 * JS Interpreter.
 */
speech.runCode = function() {
  var code = Blockly.JavaScript.workspaceToCode(workspace);
  window.console.log(code);

  //used to define wrappers for myInterpreter
  var initFunc = function(myInterpreter,scope) {

    /**
     * Wrapper to define alert. Taken from JS Interpreter documentation on
     * Blockly developer site.
     *
     * @param {String} text to be displayed
     */
    var alertWrapper = function(text) {
      text = text ? text.toString() : '';
      myInterpreter.createPrimitive(alert(text));
    };
    myInterpreter.setProperty(scope, 'alert',
        myInterpreter.createNativeFunction(alertWrapper));

    //Listen blocks

    /**
     * Wrapper to return a boolean if what the user says matches word. Uses JS
     * Interpreter to make this an asynchronous function so that execution
     * blocks until the user says a word and the word is processed.
     * Assumes word has been formatted to be in lower case with no extraneous
     * characters (using formatText).
     * Used in listen_if and listen_bool. Sends callback to JS interpreter true
     * if the word the user says equals word, and false otherwise.
     *
     * @param {String} word The word to be compared against
     * @param {fuction} callback The callback used by JS Interpreter to resume
     * execution
     */
    var listenBranchWrapper = function(word, callback) {
      word = word ? word.toString() : '';
      var localRecognizer = speech.createSpeechRecognizer();
      localRecognizer.onresult = function() {
        var speechResult = speech.formatText(event.results[0][0].transcript);
        speech.logMessage(myInterpreter, 'You said: \"' + speechResult + '\"\n');
        callback(myInterpreter.createPrimitive(speechResult == word));
      };
      localRecognizer.onnomatch = function() {
        speech.logMessage(myInterpreter,"Done listening. Didn't hear anything.");
        callback(myInterpreter.createPrimitive(false));
      };
      localRecognizer.onerror = function() {
        speech.logMessage(myInterpreter,"Done listening. Error.");
        callback(myInterpreter.createPrimitive(false));
      };
      localRecognizer.start();
      speech.logMessage(myInterpreter,"Listening...");
    };
    myInterpreter.setProperty(scope,'listen_branch',
      myInterpreter.createAsyncFunction(listenBranchWrapper));

    /**
     * Wrapper to return the string the user said. Uses JS Interpreter to make
     * this an asynchronous function so that execution blocks until the user
     * says a word and the word is processed. Used for listen_text block. It
     * feeds the string the user spoke into the callback.
     *
     * @param {function} callback - Used by JS Interpreter to resume execution
     * after blocking. During runtime, the callback is provided by JSInterpeter
     */
    var listenTextWrapper = function(callback) {
      var localRecognizer = speech.createSpeechRecognizer();
      localRecognizer.onresult = function() {
        var speechResult = event.results[0][0].transcript;
        speech.logMessage(myInterpreter, 'You said: \"' + speechResult + '\"');
        callback(myInterpreter.createPrimitive(speechResult));
      };
      localRecognizer.onnomatch = function() {
        speech.logMessage(myInterpreter,"Done listening. No match found.");
        callback(myInterpreter.createPrimitive(false));
      };
      localRecognizer.onerror = function() {
        speech.logMessage(myInterpreter,"Done listening. Error.");
        callback(myInterpreter.createPrimitive(false));
      };

      localRecognizer.start();
      speech.logMessage(myInterpreter,"Listening...");
    };
    myInterpreter.setProperty(scope,'listen_text',
        myInterpreter.createAsyncFunction(listenTextWrapper));

    //Display blocks

    /**
     * Wrapper to update the displayed image in HTML div element displayPic.
     * Needs to be done in wrapper because JS Interpreter can't access
     * displayPic internally. Used in display_img.
     *
     * @param {String} url The URL of the picture to be displayed.
     */
    var imageWrapper = function(url) {
      url = url ? url.toString() : '';
      myInterpreter.createPrimitive(
          window.document.getElementById('displayPic').src = url);
    };
    myInterpreter.setProperty(scope, 'displayImage',
        myInterpreter.createNativeFunction(imageWrapper));

    /**
     * Wrapper to pause execution for a certain number of milliseconds and then
     * resume execution. Uses JS Interpreter to make this an asynchronous
     * function so that execution blocks until the user says a word and the word
     * is processed. Used in pause.
     *
     * @param {float} time - Number of milliseconds to pause execution
     * @param {function} callback - Used by JS Interpreter to resume execution
     * after blocking.
     */
    var pauseWrapper = function(time,callback) {
      time = time ? time.toString() : '';
      var timeVar = parseInt(time);
      window.console.log(timeVar);
      var resume = function() {
        callback();
      };
      myInterpreter.createPrimitive(window.setTimeout(resume,timeVar));
    };
    myInterpreter.setProperty(scope, 'pause',
        myInterpreter.createAsyncFunction(pauseWrapper));

    /**
     * Wrapper to clear the textArea div.
     *
     * @param {String} textAreaID - id attribute of textAreaID
     * @return {Element} HTML div element that is the textArea
     */
    var clearTextWrapper = function(textAreaID) {
      //convert from JS Interpreter primitive to standard JavaScript String
      textAreaID = textAreaID ? textAreaID.toString() : '';
      var textArea;
      //uses JS Interpreter createPrimitive method to access the DOM
      myInterpreter.createPrimitive(textArea =
          document.getElementById(textAreaID));
      while (textArea.hasChildNodes()) {
        myInterpreter.createPrimitive(textArea.removeChild(textArea.lastChild));
      }
      return myInterpreter.createPrimitive(textArea);
    };
    //denotes to the interpreter that upon calls to clearText,
    //it should execute the wrapper function defined.
    myInterpreter.setProperty(scope, 'clearText',
        myInterpreter.createNativeFunction(clearTextWrapper));

    /**
     * Wrapper to append text to the given div within JS Interpreter.
     *
     * @param {String} elementType - type of element to with which to
     *    encapsulate text e.g. "p" or "h3"
     * @param {String} text - text to append to the text area
     * @param {String} textAreaID - id of text area div to which we append text
     * @return {Element} HTML textArea div
     */
    var appendTextWrapper = function(elementType, text, textAreaID) {
      text = text ? text.toString() : '';
      elementType = elementType ? elementType.toString() : '';
      textAreaID = textAreaID ? textAreaID.toString() : '';

      var node;
      var textnode;
      var textArea;
      myInterpreter.createPrimitive(node = document.createElement(elementType));
      myInterpreter.createPrimitive(textnode = document.createTextNode(text));
      myInterpreter.createPrimitive(textArea =
          document.getElementById(textAreaID));
      myInterpreter.createPrimitive(node.appendChild(textnode));
      myInterpreter.createPrimitive(
          document.getElementById(textAreaID).appendChild(node));
      return myInterpreter.createPrimitive(textArea);
    };
    myInterpreter.setProperty(scope, 'appendText',
        myInterpreter.createNativeFunction(appendTextWrapper));

    //Speech Synthesis blocks

    /**
     * Wrapper to use speech synthesis to say aloud text provided by the user.
     * Uses JS Interpreter to make this an asynchronous function so that
     * execution blocks while the speech synthesizer is speaking.
     * and the word is processed. Used in pause.
     *
     * @param {String} wordsToSay - Text for speech synthesizer to say aloud
     * @param {function} callback - Used by JS Interpreter to resume execution
     *    after blocking.
     */
    var speechWrapper = function(wordsToSay, callback) {
      wordsToSay = wordsToSay ? wordsToSay.toString() : '';
      if ('speechSynthesis' in window) {
        speech.msg.text = wordsToSay;
        window.speechSynthesis.speak(speech.msg);
      } else {
        speech.logMessage("speechSynthesis not found. Text to speech capability\
           under Web Speech API not supported.");
      }
      speech.msg.onend = function(e) {
        callback();
      };
    };
    myInterpreter.setProperty(scope, 'globalSay',
        myInterpreter.createAsyncFunction(speechWrapper));

    /**
     * Wrapper to get voices available for speech synthesis from the window.
     */
    var getVoicesWrapper = function() {
      myInterpreter.createPrimitive(window.speechSynthesis.getVoices());
    };
    myInterpreter.setProperty(scope, 'getVoices',
        myInterpreter.createNativeFunction(getVoicesWrapper));

    /**
     * Wrapper to get voices available for speech synthesis from the window.
     *
     * @param {number} newVoiceIndex - index within the voices array at which
     * the user-selected voices lives.
     */
    var setVoiceWrapper = function(newVoiceIndex) {
      //voices is defined in the blocks.js file that defines the set_voice block
      myInterpreter.createPrimitive(speech.msg.voice = voices[newVoiceIndex]);
    };
    myInterpreter.setProperty(scope, 'setVoice',
        myInterpreter.createNativeFunction(setVoiceWrapper));

    /**
     * Wrapper to set the volume of the speech synthesizer.
     *
     * @param {number} newVolume - a number n, where 0 <= n <= 1.
     */
    var setVolumeWrapper = function(newVolume) {
      myInterpreter.createPrimitive(speech.msg.volume = newVolume);
    };
    myInterpreter.setProperty(scope, 'setVolume',
        myInterpreter.createNativeFunction(setVolumeWrapper));

    /**
     * Wrapper to set the rate of speech for the speech synthesizer.
     *
     * @param {number} newRate - a number n, where .1 <= n <= 10.
     */
    var setRateWrapper = function(newRate) {
      myInterpreter.createPrimitive(speech.msg.rate = newRate);
    };
    myInterpreter.setProperty(scope, 'setRate',
        myInterpreter.createNativeFunction(setRateWrapper));
  };
  //initializes myInterpreter
  var myInterpreter = new Interpreter(code,initFunc);
  //runs myInterpreter
  speech.runButton(myInterpreter);
};

/**
 * Add a word that the recognizer should be able to recognize from the user.
 * Called from block code.
 *
 * @param {string} word The word to be added to the list of recognizable words.
 */

speech.addRecognizableWord = function(word) {
  speech.recognizableWords[speech.recognizableWords.length] = word;
};

/**
 * Uses the recognizableWords to generate a string to give to the recognizer in
 * updateGrammars.
 *
 * @return {String} the grammar string formatted correctly
 * so that it can update the grammar of a recognizer.
 */
speech.convertRecognizableWordsToString = function() {
  var grammarString = '#JSGF V1.0; grammar phrase; public <phrase> = ';
  if (speech.recognizableWords.length > 0) {
    grammarString += speech.recognizableWords[0];
  }
  for (var i = 1; i < speech.recognizableWords.length; i++) {
    grammarString += ' | ' + speech.recognizableWords[i];
  }
  grammarString += ';';
  return grammarString;
};

/**
 * Takes as an argument the recognizer to update. Sets the settings using the
 * grammar string and sets the language to US English.
 *
 * @return {Recognizer} recognizer with grammar list generated from
 *    recognizable words.
 */
speech.createSpeechRecognizer = function() {
  var myRecognizer = new speech.SpeechRecognition();
  var grammar = speech.convertRecognizableWordsToString();
  var speechRecognitionList = new speech.SpeechGrammarList();
  speechRecognitionList.addFromString(grammar, 1);
  myRecognizer.grammars = speechRecognitionList;
  myRecognizer.lang = 'en-US';
  myRecognizer.interimResults = false;
  myRecognizer.maxAlternatives = 1;
  return myRecognizer;
};

/**
 * Given a String, gets rid of punctuation and capitalization--all words are
 * left lowercase and separated by a single space.
 *
 * @param {String} text - text input for formatting
 * @return {String} formatted text
 */
speech.formatText = function(text){
  var punctuationless = text.replace(/[.,\/#!$%\^&\*;:{}—=\-_`~()]/g," ");
  //replace all spaces with a single space
  var finalString = punctuationless.replace(/\s\s+/g, ' ');
  var finalString = finalString.toLowerCase().trim();
  return finalString;
};
