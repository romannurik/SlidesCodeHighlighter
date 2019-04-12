/*
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {setTheme, DEFAULT_THEMES, THEME_PROPERTIES} from './themes.js';

const WARN_LINES = 15;
const WARN_LINE_LENGTH = 80;

const $editor = $('#editor');
const $output = $('#output');

let config = {
  code: localStorage.highlighterCode || '',
  theme: localStorage.highlighterTheme || 'light',
  lang: localStorage.highlighterLang || '--',
  typeSize: Number(localStorage.highlighterTypeSize || '40'),
  customTheme: JSON.parse(localStorage.customTheme || JSON.stringify(DEFAULT_THEMES['light'])),
};

setupEditorToolbar();
setupEditor();
setupOutputToolbar();
setupOutputArea();
updateOutputArea();
setupCustomThemeEditor();
installServiceWorker();


function setupEditor() {
  let editor = ace.edit($editor.get(0));
  editor.$blockScrolling = Infinity;
  editor.setValue(config.code, -1);
  editor.setTheme('ace/theme/chrome');
  editor.getSession().setMode('ace/mode/text');
  editor.setOptions({
    fontFamily: 'Roboto Mono',
    fontSize: '11pt',
  });
  editor.on('change', () => {
    localStorage.highlighterCode = config.code = editor.getValue();
    updateOutputArea();
  });
}


function setupOutputArea() {
  // select all on click
  $output.click(() => {
    var selection = window.getSelection();
    var range = document.createRange();
    range.selectNodeContents($output.find('pre').get(0));
    selection.removeAllRanges();
    selection.addRange(range);
  });

  // re-layout on window resize
  $(window).on('resize', () => updateOutputArea());
}


function setupEditorToolbar() {
  let $theme = $('#theme');
  let $lang = $('#lang');

  $theme
      .val(config.theme)
      .on('input', () => {
        localStorage.highlighterTheme = config.theme = $theme.val();
        updateOutputArea();
      });

  $lang
      .val(config.lang)
      .on('input', () => {
        localStorage.highlighterLang = config.lang = $lang.val();
        updateOutputArea();
      });
}


function setupOutputToolbar() {
  let $typeSize = $('#type-size');

  let setTypeSize_ = size => {
    if ($typeSize.val() != String(size)) {
      $typeSize.val(size);
    }
    config.typeSize = size;
    localStorage.highlighterTypeSize = String(config.typeSize);
    updateOutputArea();
  };

  $typeSize
      .val(config.typeSize)
      .on('input', () => {
        let val = parseInt($typeSize.val(), 10);
        if (!isNaN(val) && val > 8) {
          setTypeSize_(val);
        }
      })
      .on('keydown', ev => {
        if (!ev.shiftKey) {
          if (ev.keyCode == 38 || ev.keyCode == 40) {
            setTypeSize_(parseInt($typeSize.val(), 10) + (ev.keyCode == 38 ? 1 : -1));
            ev.preventDefault();
          }
        }
      })
      .on('blur', ev => setTypeSize_(config.typeSize));
}


function updateOutputArea() {
  let $messages = $('.edit-area .messages');
  $messages.empty();

  $output.empty();

  // set theme
  if (config.theme == 'custom') {
    $('.custom-theme-area').show();
    setTheme(config.customTheme, config.typeSize);
  } else {
    $('.custom-theme-area').hide();
    setTheme(DEFAULT_THEMES[config.theme], config.typeSize);
  }

  // build pre element
  let $pre = $('<pre>')
      .addClass('prettyprint')
      .css({
        'font-size': `${config.typeSize}px`,
        'background': 'transparent',
      })
      .text(cleanupCode(config.code))
      .appendTo($output);
  if (config.lang != '--') {
    $pre.addClass(`lang-${config.lang}`);
  }

  prettyPrint();

  // find width by measuring the longest line
  let preWidth = Math.max(1, measureNaturalPreWidth($pre));
  let preHeight = Math.max(1, $pre.outerHeight());

  // center and scale the pre in the output area
  let scale = Math.min(1, Math.min(
      $output.width() / preWidth,
      $output.height() / preHeight));
  $pre.css({
    width: preWidth,
    transform: `translate(-50%, -50%) scale(${scale})`
  });

  // show messages
  let messages = [];

  if ((config.code.match(/\n/g) || []).length >= WARN_LINES) {
    messages.push({
      type: 'warning',
      message:
        `More than ${WARN_LINES} lines of code will be hard to read in a
        slide presentation.`
    });
  }

  let lines = config.code.split('\n') || [];

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].length > WARN_LINE_LENGTH) {
      messages.push({
        type: 'warning',
        message:
          `Line ${(i + 1)} has more than ${WARN_LINE_LENGTH} characters!`
      });
      break;
    }
  }

  messages.forEach(({type, message}) =>
      $('<div>')
          .addClass(`message message-${type}`)
          .text(message)
          .appendTo($messages));
}


function cleanupCode(code) {
  // Tabs to 4 spaces
  code = code.replace(/\t/g, '    ');

  // Remove trailing whitespace
  code = code.replace(/ +\n/g, '\n');

  // Remove common indent
  let commonIndent = -1;
  let lines = code.split('\n');
  lines.forEach(line => {
    if (!$.trim(line)) {
      return;
    }

    let indent = line.match(/^\s*/)[0].length;
    if (indent < commonIndent || commonIndent == -1) {
      commonIndent = indent;
    }
  });

  if (commonIndent > 0) {
    code = code
        .split('\n')
        .map(line => line.substring(commonIndent))
        .join('\n');
  }

  return code;
}


function measureNaturalPreWidth(pre) {
  // compute the natural width of a monospace <pre> by computing
  // the length of its longest line
  let $pre = $(pre);
  let longestLine = $pre.text()
      .split('\n')
      .reduce((longest, line) => (longest.length > line.length) ? longest : line, '');

  let $preClone = $pre
      .clone()
      .css({
        position: 'fixed',
        left: -10000,
        top: 0,
        display: 'inline-block',
        width: 'auto',
        height: 'auto',
      })
      .text(longestLine)
      .appendTo(document.body);

  let naturalWidth = $preClone.width();
  $preClone.remove();
  return naturalWidth;
}


function setupCustomThemeEditor() {
  let rebuildCustomThemeProperties = () => {
    let $customThemeEditor = $('.custom-theme-editor').empty();
    for (let prop of THEME_PROPERTIES) {
      let $prop = $('<div>')
          .addClass('custom-theme-prop')
          .appendTo($customThemeEditor);
      let $label = $('<label>')
          .appendTo($prop);
      let $input = $('<input>')
          .attr('type', 'color')
          .val(config.customTheme[prop.id])
          .on('input', () => {
            config.customTheme[prop.id] = $input.val();
            localStorage.customTheme = JSON.stringify(config.customTheme);
            updateOutputArea();
          })
          .appendTo($label);
      $label.append(`<span>${prop.name}</span>`); // text
    }
  }

  rebuildCustomThemeProperties();

  $('.custom-theme-import-export').click(() => {
    let currentJSON = JSON.stringify(config.customTheme);
    let newJSON = window.prompt(
        'Copy the below JSON or paste new JSON for your custom theme.', currentJSON);
    if (newJSON && newJSON != currentJSON) {
      try {
        config.customTheme = Object.assign({}, DEFAULT_THEMES['light'], JSON.parse(newJSON) || {});
        localStorage.customTheme = JSON.stringify(config.customTheme);
        updateOutputArea();
        rebuildCustomThemeProperties();
      } catch (e) {
        alert('Error parsing the JSON: ' + e);
      }
    }
  });
}


function installServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').then(registration => {
        console.log('SW registered: ', registration);
      }).catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
    });
  }
}
