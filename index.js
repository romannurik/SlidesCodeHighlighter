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

import { DEFAULT_THEMES, setTheme, THEME_PROPERTIES } from './themes.js';

const WARN_LINES = 15;
const WARN_LINE_LENGTH = 80;

const $editor = $('#editor');
const $output = $('#output');

let config = {
  code: localStorage.highlighterCode || '',
  theme: localStorage.highlighterTheme || 'light',
  lang: localStorage.highlighterLang || '',
  font: localStorage.highlighterFont || 'Roboto Mono',
  tabSize: Number(localStorage.highlighterTabSize || '4'),
  typeSize: Number(localStorage.highlighterTypeSize || '40'),
  selectionTreatment: localStorage.highlighterSelectionTreatment || 'focus',
  customTheme: JSON.parse(localStorage.customTheme || JSON.stringify(DEFAULT_THEMES['light'])),
};

if (!!window.location.search) {
  loadConfigFromUrl();
}

if (config.lang == '--') {
  config.lang = '';
}

let editor;

setupToolbar();
setupEditor();
setupOutputArea();
updateOutputArea();
setupCustomThemeEditor();
loadFont();
installServiceWorker();


function setupEditor() {
  let updateCode_ = code => {
    localStorage.highlighterCode = config.code = code;
    updateOutputArea();
  };

  if (navigator.userAgent.match(/iP(hone|od|ad)|Android/)) {
    // Ace editor is pretty busted on mobile, just use a <textarea>
    let $textArea = $('<textarea>')
      .attr('autocapitalize', 'off')
      .attr('spellcheck', 'false')
      .val(config.code)
      .on('input', () => updateCode_($textArea.val()))
      .appendTo($editor);
    return;
  }

  editor = ace.edit($editor.get(0));
  editor.$blockScrolling = Infinity;
  editor.setValue(config.code, -1);
  editor.setTheme('ace/theme/chrome');
  editor.getSession().setMode('ace/mode/text');
  editor.setOptions({
    fontFamily: 'Roboto Mono',
    fontSize: '11pt',
  });
  editor.on('change', () => updateCode_(editor.getValue()));
  editor.getSelection().on('changeCursor', () => updateOutputArea());
  editor.getSelection().on('changeSelection', () => updateOutputArea());
  updateEditorParams();
}


function updateEditorParams() {
  if (!editor) {
    return;
  }

  editor.setOptions({
    fontFamily: config.font,
    fontSize: '11pt',
  });
  editor.getSession().setTabSize(config.tabSize);
}


function setupOutputArea() {
  // select all on click
  $output.on('click', () => {
    var selection = window.getSelection();
    var range = document.createRange();
    range.selectNodeContents($output.find('pre').get(0));
    selection.removeAllRanges();
    selection.addRange(range);
  });

  // re-layout on window resize
  $(window).on('resize', () => updateOutputArea());
  document.fonts.ready.then(() => updateOutputArea());
}


function setupToolbar() {
  $('#theme')
    .val(config.theme)
    .on('input', ev => {
      localStorage.highlighterTheme = config.theme = $(ev.target).val();
      updateConfigUrl();
      updateOutputArea();
    });

  $('#lang')
    .val(config.lang)
    .on('input', ev => {
      localStorage.highlighterLang = config.lang = $(ev.target).val();
      // updateConfigUrl();
      updateOutputArea();
    });

  let $dl = $('#lang-datalist');
  let langs = Object.keys(Prism.languages)
    .filter(s => typeof Prism.languages[s] == 'object');
  for (let lang of langs) {
    $dl.append($('<option>').attr('value', lang));
  }

  $('#tab-size')
    .val(config.tabSize)
    .on('input', ev => {
      localStorage.highlighterTabSize = $(ev.target).val();
      config.tabSize = Number(localStorage.highlighterTabSize);
      updateEditorParams();
      updateConfigUrl();
      updateOutputArea();
    });

  $('#font')
    .val(config.font)
    .on('input', ev => {
      localStorage.highlighterFont = config.font = $(ev.target).val();
      updateConfigUrl();
      loadFont();
    });

  $('#selection-treatment')
    .val(config.selectionTreatment)
    .on('input', ev => {
      localStorage.highlighterSelectionTreatment = config.selectionTreatment = $(ev.target).val();
      updateConfigUrl();
      updateOutputArea();
    });

  let $typeSize = $('#type-size');

  let setTypeSize_ = size => {
    if ($typeSize.val() != String(size)) {
      $typeSize.val(size);
    }
    config.typeSize = size;
    localStorage.highlighterTypeSize = String(config.typeSize);
    updateConfigUrl();
    updateOutputArea();
  };

  $typeSize
    .val(config.typeSize)
    .on('input', () => {
      let val = parseInt($typeSize.val(), 10);
      if (!isNaN(val) && val > 4) {
        setTypeSize_(val);
      }
    })
    .on('keydown', ev => {
      if (!ev.shiftKey) {
        if (ev.key == 'ArrowUp' || ev.key == 'ArrowDown') {
          setTypeSize_(parseInt($typeSize.val(), 10) + (ev.key == 'ArrowUp' ? 1 : -1));
          ev.preventDefault();
        }
      }
    })
    .on('blur', ev => setTypeSize_(config.typeSize));
}


function updateConfigUrl() {
  let p = new URLSearchParams();
  // p.set('lang', config.lang);
  if (config.theme === 'custom') {
    p.set('theme', 'custom');
    for (let [k, v] of Object.entries(config.customTheme)) {
      let { type, short } = THEME_PROPERTIES.find(s => s.id === k);
      p.set(`t.${short}`, type === 'color' ? v.replace(/^#/, '') : v);
    }
  } else {
    p.set('theme', config.theme);
  }
  p.set('font', config.font);
  p.set('tab', config.tabSize);
  p.set('size', config.typeSize);
  p.set('sel', config.selectionTreatment);
  window.history.replaceState('', '', '?' + p.toString());
}


function loadConfigFromUrl() {
  let p = new URLSearchParams(window.location.search);
  // if (p.has('lang')) config.lang = p.get('lang');
  if (p.has('theme')) {
    let theme = p.get('theme');
    if (theme === 'custom') {
      config.theme = 'custom';
      let customTheme = {};
      for (let k of [...p.keys()].filter(k => k.startsWith('t.'))) {
        let { type, id } = THEME_PROPERTIES.find(s => s.short === k.replace(/^t\./, ''));
        customTheme[id] = type === 'color' ? '#' + p.get(k) : p.get(k);
      }
      config.customTheme = customTheme;
    }
  }
  if (p.has('font')) config.font = p.get('font');
  if (p.has('tab')) config.tabSize = p.get('tab');
  if (p.has('size')) config.typeSize = p.get('size');
  if (p.has('sel')) config.selectionTreatment = p.get('sel');
}


function loadFont() {
  WebFont.load({
    google: {
      families: [`${config.font}:400,700`]
    },
    active: () => {
      updateEditorParams();
      updateOutputArea();
    }
  });
}


function updateOutputArea() {
  let $messages = $('.edit-area .messages');
  $messages.empty();

  $output.empty();

  // set theme
  if (config.theme == 'custom') {
    $('.custom-theme-area').css('display', 'flex');
    setTheme(config.customTheme, config.typeSize);
  } else {
    $('.custom-theme-area').css('display', 'none');
    setTheme(DEFAULT_THEMES[config.theme], config.typeSize);
  }

  // build pre element
  let $pre = $('<pre>')
    .addClass('prettyprint')
    .css({
      'font-family': config.font,
      'font-size': `${config.typeSize}px`,
      'background': 'transparent',
    })
    .appendTo($output);
  let lang = config.lang;
  if (lang == '') {
    lang = /\s*</.test(config.code) ? 'markup' : 'js';
  }

  if (!Prism.languages[lang]) {
    $('#lang').addClass('is-invalid');
    return;
  }

  $('#lang').removeClass('is-invalid');

  let html = Prism.highlight(
    cleanupCode(config.code).code,
    Prism.languages[lang], lang);
  $pre.html(html);
  highlightSelection();

  // add line numbers
  if (false) {
    addLineNumbers();
  }

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

  messages.forEach(({ type, message }) =>
    $('<div>')
      .addClass(`message message-${type}`)
      .text(message)
      .appendTo($messages));
}

const htmlEscape = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function highlightSelection() {
  if (!editor) {
    return;
  }

  $output.removeClass('has-highlights');
  $output.removeAttr('data-seltreat');

  if (config.selectionTreatment == '--') {
    return;
  }

  $output.attr('data-seltreat', config.selectionTreatment);

  let rawCode = config.code;
  let { code, commonIndent, leadingEmptyLines } = cleanupCode(rawCode);
  let preRoot = $output.find('pre').get(0);

  let rangeToCharPos = ({ row, column }) => code.split(/\r?\n/)
    .slice(0, row - leadingEmptyLines)
    .reduce((a, r) => a + r.length + 1, 0)
    + Math.max(0,
      ((rawCode.split(/\n/)[row] || '').substring(0, column).match(/\t/g) || []).length
      * (config.tabSize - 1)
      + column - commonIndent);

  let hasHighlights = false;
  for (let range of editor.getSelection().getAllRanges()) {
    let targetStartPos = rangeToCharPos(range.start);
    let targetEndPos = rangeToCharPos(range.end);

    if (targetEndPos == targetStartPos) {
      continue;
    }
    hasHighlights = true;

    let childStartPos = 0;

    let traverse_ = (parent, emptyClass = '') => {
      for (let child of Array.from(parent.childNodes)) {
        if (child.childNodes.length >= 2 ||
          (child.childNodes.length >= 1
            && child.childNodes[0].nodeType != 3 /* TEXT */)) {
          // this is a complex element, traverse it instead of treating it
          // as a leaf nodeS
          traverse_(child, child.className);
          continue;
        }

        let childContent = child.textContent;
        let childEndPos = childStartPos + childContent.length;

        if (targetStartPos < childEndPos && targetEndPos >= childStartPos) {
          // some overlap
          let startInChild = Math.max(0, targetStartPos - childStartPos);
          let endInChild = Math.min(childContent.length, childContent.length - (childEndPos - targetEndPos));

          let makeSub = (tag, start, end) => {
            if (start == end) {
              return null;
            }

            let f = document.createElement(tag);
            if (child.className) {
              f.className = child.className;
            } else if (emptyClass) {
              f.className = emptyClass;
            }
            f.innerHTML = htmlEscape(childContent.substring(start, end));
            return f;
          };

          child.replaceWith.apply(child, [
            makeSub('span', 0, startInChild),
            makeSub('mark', startInChild, endInChild),
            makeSub('span', endInChild, childContent.length),
          ].filter(s => !!s));
        }

        childStartPos = childEndPos;
      }
    };

    traverse_(preRoot);
  }

  $output.toggleClass('has-highlights', hasHighlights);
}

function addLineNumbers() {
  let $pre = $output.find('pre');
  let htmlLines = $pre.html().split(/\n/);
  $pre.html(htmlLines
    .map((s, ind) => `<span style="color:grey">` +
      String(ind + 1).padStart(Math.ceil((htmlLines.length + 1) / 10), ' ') +
      `</span>  ${s}`)
    .join('\n'));
}


function cleanupCode(code) {
  let lines = code.split('\n');

  // Remove leading and trailing empty lines
  let leadingEmptyLines = 0;
  for (let line of lines) {
    if (line.match(/^\s*$/)) {
      ++leadingEmptyLines;
    } else {
      break;
    }
  }

  let trailingEmptyLines = 0;
  for (let line of [...lines].reverse()) {
    if (line.match(/^\s*$/)) {
      ++trailingEmptyLines;
    } else {
      break;
    }
  }

  if (leadingEmptyLines == lines.length) {
    trailingEmptyLines = 0;
  }

  lines = lines.slice(leadingEmptyLines, lines.length - trailingEmptyLines);

  // Tabs to 4 spaces
  lines = lines.map(line => line.replace(/\t/g, ' '.repeat(config.tabSize)));

  // Remove trailing whitespace
  lines = lines.map(line => line.replace(/ +$/g, ''));

  // Remove common indent
  let commonIndent = -1;
  for (let line of lines) {
    if (!$.trim(line)) {
      continue;
    }

    let indent = line.match(/^\s*/)[0].length;
    if (indent < commonIndent || commonIndent == -1) {
      commonIndent = indent;
    }
  }

  if (commonIndent > 0) {
    lines = lines.map(line => line.substring(commonIndent));
  }

  code = lines.join('\n');
  return { code, commonIndent, leadingEmptyLines, trailingEmptyLines };
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
  let sanitize_ = s => s.replace(/^\s*|\s*$/g, '').toUpperCase();

  let rebuildCustomThemeProperties = () => {
    let $customThemeEditor = $('.custom-theme-editor').empty();
    for (let prop of THEME_PROPERTIES.filter(s => !s.hideEditor)) {
      let $prop = $('<div>')
        .addClass('custom-theme-prop')
        .appendTo($customThemeEditor);
      let $label = $('<label>')
        .appendTo($prop);
      let hexColor = String(config.customTheme[prop.id] || '#000000').toUpperCase();
      let $textInput, $colorInput;
      $colorInput = $('<input>')
        .attr('type', 'color')
        .val(hexColor)
        .on('input', () => {
          config.customTheme[prop.id] = sanitize_($colorInput.val());
          $textInput.val(config.customTheme[prop.id]);
          localStorage.customTheme = JSON.stringify(config.customTheme);
          updateConfigUrl();
          updateOutputArea();
        })
        .appendTo($label);
      $textInput = $('<input>')
        .attr('type', 'text')
        .val(hexColor)
        .on('input', () => {
          config.customTheme[prop.id] = sanitize_($textInput.val());
          $colorInput.val(config.customTheme[prop.id]);
          localStorage.customTheme = JSON.stringify(config.customTheme);
          updateConfigUrl();
          updateOutputArea();
        })
        .appendTo($label);
      $label.append(`<span>${prop.name}</span>`); // text
    }
  }

  rebuildCustomThemeProperties();

  $('.custom-theme-import-export').on('click', () => {
    let currentJSON = JSON.stringify(config.customTheme);
    let newJSON = window.prompt(
      'Copy the below JSON or paste new JSON for your custom theme.', currentJSON);
    if (newJSON && newJSON != currentJSON) {
      try {
        config.customTheme = Object.assign({}, DEFAULT_THEMES['light'], JSON.parse(newJSON) || {});
        localStorage.customTheme = JSON.stringify(config.customTheme);
        updateConfigUrl();
        updateOutputArea();
        rebuildCustomThemeProperties();
      } catch (e) {
        alert('Error parsing the JSON: ' + e);
      }
    }
  });

  $('.custom-theme-reset').on('click', () => {
    config.customTheme = { ...DEFAULT_THEMES['light'] };
    localStorage.customTheme = JSON.stringify(config.customTheme);
    updateConfigUrl();
    updateOutputArea();
    rebuildCustomThemeProperties();
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
