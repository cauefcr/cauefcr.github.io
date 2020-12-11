import { cloneCommandNode, asd, markup } from './modules';
import style from './VanillaTerminal.css'; // eslint-disable-line

import * as R from "ramda";
window.R = R;

const pretty =require("pretty-js");
const { addEventListener, localStorage } = window;

// window.Filer = require('filer');
// window.fs = new Filer.FileSystem().promises;
// window.sh = fs.Shell();

const KEY = 'VanillaTerm';
const version = "0.0.1";
let __to_do = JSON.parse(window.localStorage["to-do"]||"[]");
const COMMANDS = {
  clear: terminal => {
    terminal.clear();
    __to_do = __to_do.filter(x => !x.done);
    window.localStorage["to-do"]=JSON.stringify(__to_do);
  },
  
  help: (terminal, [command]) => {
    if (command) {
      terminal.output(`help: ${HELP[command] || `no help topics match <u>${command}</u>`}`);
    } else {
      terminal.output('These shell commands are defined internally. Type <u>help</u> for see the list.');
      terminal.output('Type <u>help name</u> to find out more about the function <u>name</u>.');
      terminal.output(Object.keys(terminal.commands).join(', '));
    }
  },
  
  version: terminal => terminal.output(`Vanilla Terminal v${version}`),
  
  wipe: (terminal) => {
    terminal.prompt('Are you sure remove all your commands history? Y/N', (value) => {
      if (value.trim().toUpperCase() === 'Y') {
        localStorage.removeItem(KEY);
        localStorage.removeItem("to-do");
        terminal.history = []; // eslint-disable-line
        terminal.historyCursor = 0; // eslint-disable-line
        terminal.output('History of commands wiped.');
      }
    });
  },
  do: (terminal,...thing) => {
    // const coisa = thing.join(" ");
    __to_do.push({text:thing.flatMap(x => x).join(" "),done:false,num:__to_do.length});
    window.localStorage["to-do"]=JSON.stringify(__to_do);
    terminal.output("done");
  },
  todo: (terminal) => {
    terminal.output(__to_do.map(e => `${e.num}:${e.done?"✔️":"❌"} - ${e.text}`).join("<br>"))
  },
  done: (terminal,...num) => {
    num = num.flatMap(x => x);
    __to_do.filter(e => num.filter(n => n == e.num).length > 0).forEach(e => e.done=true);
    window.localStorage["to-do"]=JSON.stringify(__to_do);
    terminal.output("done");
  }
};

class Terminal {
  constructor(props = {}) {
    
    const {
      container = 'vanilla-terminal',
      commands = {},
      welcome = `${Date()}`,
      prompt = '',
      separator = '&gt;',
    } = props;
    this.commands = commands;
    Object.keys(COMMANDS).forEach(k => commands[k]=COMMANDS[k]);
    this.history = localStorage[KEY] ? JSON.parse(localStorage[KEY]) : [];
    this.history.filter(x => x.search(/(=|import|function|delete)/) != -1).forEach(e => {
      console.log(e);
      try{
        window.eval(e);
      }catch(e){
        console.log(e);
      }
    });
    this.historyCursor = this.history.length;
    this.welcome = welcome;
    this.shell = { prompt, separator };
    
    const el = document.getElementById(container);
    if (el) {
      this.cacheDOM(el);
      this.addListeners();
      if (welcome) this.output(welcome);
    } else throw Error(`Container #${container} doesn't exists.`);
  }
  
  state = {
    prompt: undefined,
    idle: undefined,
  };
  
  cacheDOM = (el) => {
    el.classList.add(KEY);
    el.insertAdjacentHTML('beforeEnd', markup(this));
    
    // Cache DOM nodes
    const container = el.querySelector('.container');
    this.DOM = {
      container,
      output: container.querySelector('output'),
      command: container.querySelector('.command'),
      input: container.querySelector('.command .input'),
      prompt: container.querySelector('.command .prompt'),
    };
  }
  
  addListeners = () => {
    const { DOM } = this;
    var TabComplete = function (input) {
      var source = [...Object.keys(window)];
      // variables used in tab completion
      var prevKeyWasTab = false,
      pattern = '', // text fragment respective pattern to look for
      candidate = '', // candidate
      sourcePos = 0, // the search starting position
      
      // variables used in multi tab completion
      patternPos = -1,
      prePattern = "";
      
      // the keydown event handler
      var keyHandler = function (event) {
        source = [...Object.keys(window.eval(input.value.slice(0,R.max(0,input.value.lastIndexOf("."))))||window)];
        //Note: you may need to further play with the line below to enable support for additional UAs
        event = event || window.event; // support for IE8
        if (event.keyCode == 9) {
          
          // Note: you may need to further play with the line below to enable support for additional UAs
          event.preventDefault ? event.preventDefault() : event.returnValue = false; // + support for IE8
          
          if (!prevKeyWasTab) {
            prevKeyWasTab = true;
            pattern = input.value;
            patternPos = pattern.lastIndexOf('.');
            if (patternPos !== -1) {
              prePattern = pattern.substr(0, patternPos + 1);
              pattern = pattern.substr(patternPos + 1);
            };
            
            pattern = new RegExp('^' + pattern, 'i');
            sourcePos = 0;
            candidate = incrementalSearch(pattern, source, sourcePos);
            if (candidate.length) {
              // candidate found
              input.value = prePattern + candidate;
              return;
            }
            
          } else {
            candidate = incrementalSearch(pattern, source, sourcePos);
            if (candidate.length) {
              // candidate found
              input.value = prePattern + candidate;
              return;
            }
          }
          
        } else {
          prevKeyWasTab = false;
          prePattern = "";
          
          // we do not want the source to change during tabcompletion
          // source = nicks;
        }
      }
      
      // helper function
      var incrementalSearch = function (pattern, source, sp) {
        var result = "",
        r = 0,
        i = 0;
        
        for (i = sp; i < source.length; i++) {
          r = source[i].search(pattern);
          sourcePos = (i + 1 > source.length - 1) ? 0 : i + 1;
          if (!r) return source[i];
        }
        for (i = 0; i < sp; i++) {
          r = source[i].search(pattern);
          sourcePos = i + 1;
          if (r) return source[i];
        }
        return result;
      };
      
      if(input.addEventListener) {
        input.addEventListener('keydown', keyHandler, false);
      } else {
        input.addEvent('onkeydown', keyHandler);
      }
      
    };
    
    
    var tabber = new TabComplete(DOM.input);
    DOM.output.addEventListener('DOMSubtreeModified', () => {
      setTimeout(() => DOM.input.scrollIntoView(), 10);
    }, false);
    
    addEventListener('click', () => DOM.input.focus(), false);
    DOM.output.addEventListener('click', event => event.stopPropagation(), false);
    DOM.input.addEventListener('keyup', this.onKeyUp, false);
    DOM.input.addEventListener('keydown', this.onKeyDown, false);
    DOM.command.addEventListener('click', () => DOM.input.focus(), false);
    
    addEventListener('keyup', (event) => {
      DOM.input.focus();
      event.stopPropagation();
      event.preventDefault();
    }, false);
    
    
  }
  
  onKeyUp = (event) => {
    const { keyCode } = event;
    const { DOM, history = [], historyCursor } = this;
    
    if (keyCode === 27) { // ESC key
      DOM.input.value = '';
      event.stopPropagation();
      event.preventDefault();
    } else if ([38, 40].includes(keyCode)) {
      if (keyCode === 38 && historyCursor > 0) this.historyCursor -= 1; // {38} UP key
      if (keyCode === 40 && historyCursor < history.length - 1) this.historyCursor += 1; // {40} DOWN key
      
      if (history[this.historyCursor]) DOM.input.value = history[this.historyCursor];
    }
  }
  
  onKeyDown = ({ keyCode }) => {
    const {
      commands = {}, DOM, history, onInputCallback, state,
    } = this;
    const commandLine = DOM.input.value.trim();
    if (keyCode !== 13 || !commandLine) return;
    
    const [command, ...parameters] = commandLine.split(' ');
    
    if (state.prompt) {
      state.prompt = false;
      this.onAskCallback(command);
      this.setPrompt();
      this.resetCommand();
      return;
    }
    
    // Save command line in history
    history.push(commandLine);
    localStorage[KEY] = JSON.stringify(history);
    this.historyCursor = history.length;
    
    // Clone command as a new output line
    DOM.output.appendChild(cloneCommandNode(DOM.command));
    
    // Clean command line
    DOM.command.classList.add('hidden');
    DOM.input.value = '';
    
    // Dispatch command
    if (Object.keys(commands).includes(command)) {
      const callback = commands[command];
      if (callback) callback(this, parameters);
      if (onInputCallback) onInputCallback(command, parameters);
    } else {
      try{
        const out = JSON.stringify(window.eval(commandLine))
        if(!!out)
          this.output(`${pretty(out)}`);
        else
          this.output("undefined");
      }catch(e){
        this.output(`<u>${command}</u>: ${e}`);
      }
    }
  }
  
  resetCommand = () => {
    const { DOM } = this;
    
    DOM.input.value = '';
    DOM.command.classList.remove('input');
    DOM.command.classList.remove('hidden');
    if (DOM.input.scrollIntoView) DOM.input.scrollIntoView();
  }
  
  
  clear() {
    this.history = [];
    this.DOM.output.innerHTML = '';
    this.resetCommand();
  }
  
  idle() {
    const { DOM } = this;
    
    DOM.command.classList.add('idle');
    DOM.prompt.innerHTML = '<div class="spinner"></div>';
  }
  
  prompt(prompt, callback = () => {}) {
    this.state.prompt = true;
    this.onAskCallback = callback;
    this.DOM.prompt.innerHTML = `${prompt}:`;
    this.resetCommand();
    this.DOM.command.classList.add('input');
  }
  
  onInput(callback) {
    this.onInputCallback = callback;
  }
  
  output(html = '&nbsp;') {
    this.DOM.output.insertAdjacentHTML('beforeEnd', `<span>${html}</span>`);
    this.resetCommand();
  }
  
  setPrompt(prompt = this.shell.prompt) {
    const { DOM, shell: { separator } } = this;
    
    this.shell = { prompt, separator };
    DOM.command.classList.remove('idle');
    DOM.prompt.innerHTML = `${prompt}${separator}`;
    DOM.input.focus();
  }
}

if (window) window.VanillaTerminal = Terminal;

export default Terminal;
