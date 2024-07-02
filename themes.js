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

import $ from 'jquery';
import { materialColor } from './material-colors.js';

export const THEME_PROPERTIES = [
  { short: 'b', id: 'bgColor', name: 'Background', type: 'color' },
  { short: 't', id: 'textColor', name: 'Plain text', type: 'color' },
  { short: 'p', id: 'punctuationColor', name: 'Punctuation', type: 'color' },
  { short: 'o', id: 'operatorColor', name: 'Operators', type: 'color' },
  { short: 's', id: 'stringAndValueColor', name: 'Strings, values', type: 'color' },
  { short: 'k', id: 'keywordTagColor', name: 'Keywords, tags', type: 'color' },
  { short: 'c', id: 'commentColor', name: 'Comments', type: 'color' },
  { short: 'y', id: 'typeColor', name: 'Types', type: 'color' },
  { short: 'n', id: 'numberColor', name: 'Numbers', type: 'color' },
  { short: 'd', id: 'declarationColor', name: 'Declarations', type: 'color' },
  { short: 'i', id: 'dimmedColor', name: 'Selection: Unfocused', type: 'color' },
  { short: 'h', id: 'highlightColor', name: 'Selection: Highlighter', type: 'color' },
  { short: 'lh', id: 'lineHeight', name: 'Line height', hideEditor: true },
];


export function setTheme(theme, typeSize) {
  let { bgColor, textColor, punctuationColor, stringAndValueColor, operatorColor,
    keywordTagColor, commentColor, typeColor, numberColor, declarationColor, dimmedColor,
    highlightColor, lineHeight } = theme;
  lineHeight = lineHeight || 1.5;
  let css = `
    #output pre,
    #output pre mark {
      line-height: ${lineHeight * typeSize}px;
      color: ${textColor};
    }
    #output.has-highlights[data-seltreat="focus"] pre > :not(mark),
    #output.has-highlights[data-seltreat="focus"] pre :not(mark),
    #output.has-highlights[data-seltreat="focus"] pre {
      color: ${dimmedColor || 'grey'};
    }
    #output.has-highlights[data-seltreat="highlight"] pre mark {
      background-color: ${highlightColor || 'yellow'};
    }
    #output::after {
      /* to avoid background color being copied to clipboard */
      background-color: ${bgColor};
    }

    #output pre .token.comment,
    #output pre .token.prolog,
    #output pre .token.doctype,
    #output pre .token.cdata {
      color: ${commentColor};
    }
    
    #output pre .token.namespace {
      opacity: .7;
    }
    
    #output pre .token.string,
    #output pre .token.regex,
    #output pre .token.attr-value {
      color: ${stringAndValueColor};
    }
    
    #output pre .token.punctuation {
      color: ${punctuationColor};
    }

    #output pre .token.operator {
      color: ${operatorColor || punctuationColor};
    }
    
    #output pre .token.entity,
    #output pre .token.url,
    #output pre .token.symbol,
    #output pre .token.number,
    #output pre .token.variable,
    #output pre .token.constant,
    #output pre .token.inserted {
      color: ${numberColor};
    }
    
    #output pre .token.atrule,
    #output pre .token.class-name,
    #output pre .token.attr-name,
    #output pre .token.selector,
    #output pre .token.builtin {
      color: ${typeColor};
    }
    
    #output pre .token.deleted,
    #output pre .token.property,
    #output pre .token.boolean,
    #output pre .token.keyword,
    #output pre .token.tag {
      color: ${keywordTagColor};
    }
    
    #output pre .token.important,
    #output pre .token.metadata {
      color: ${declarationColor};
    }
    
    #output pre .token.bold {
      font-weight: bold;
    }
    
    #output pre .token.italic {
      font-style: italic;
    }
  `;

  $('[theme-rules]').remove();

  $('<style>')
    .attr('theme-rules', true)
    .text(css)
    .appendTo(document.body);
  $('.message-bgcolor').text(`Set your background color to: ${bgColor.toUpperCase()}`);
}

export const DEFAULT_THEMES = {
  'light': {
    bgColor: materialColor('grey', '100'),
    textColor: materialColor('blue-grey', '800'),
    punctuationColor: materialColor('blue-grey', '800'),
    stringAndValueColor: materialColor('green', '700'),
    keywordTagColor: materialColor('indigo', '500'),
    commentColor: materialColor('pink', '600'),
    typeColor: materialColor('purple', '500'),
    numberColor: '#c53929', // g-red 700
    declarationColor: materialColor('cyan', '700'),
    dimmedColor: materialColor('grey', '400'),
    highlightColor: materialColor('grey', '300'),
    lineHeight: 1.5,
  },
  'light-alt': {
    bgColor: '#eeeeee',
    textColor: '#000000',
    punctuationColor: '#a3a3a3',
    stringAndValueColor: '#0f9d58',
    keywordTagColor: '#4285f4',
    commentColor: '#999999',
    typeColor: '#673ab7',
    numberColor: '#db4437',
    // attrNameColor: #e91e63,
    declarationColor: '#e67c73',
    dimmedColor: materialColor('grey', '400'),
    highlightColor: '#dddddd',
    lineHeight: 1.5,
  },
  'dark': {
    bgColor: materialColor('grey', '900'),
    textColor: materialColor('blue-grey', '50'),
    punctuationColor: materialColor('blue-grey', '50'),
    stringAndValueColor: materialColor('light-green', '400'),
    keywordTagColor: materialColor('cyan', '300'),
    commentColor: materialColor('pink', '300'),
    typeColor: materialColor('purple', '200'),
    numberColor: materialColor('yellow', '700'),
    declarationColor: materialColor('yellow', '700'),
    dimmedColor: materialColor('grey', '500'),
    highlightColor: materialColor('grey', '700'),
    lineHeight: 1.5,
  },
  'dark-alt': {
    bgColor: '#000000',
    textColor: '#ffffff',
    punctuationColor: '#a3a3a3',
    stringAndValueColor: '#57bb8a',
    keywordTagColor: '#7baaf7',
    commentColor: '#aaaaaa',
    typeColor: '#ff8a65', // alt #f06292
    numberColor: '#f4b400',
    declarationColor: '#f06292',
    dimmedColor: '#777777',
    highlightColor: '#444444',
    lineHeight: 1.5,
  },
  'design-dark': {
    bgColor: '#263238',
    textColor: '#ffffff',
    punctuationColor: '#90a4ae',
    stringAndValueColor: '#00bfa4',
    keywordTagColor: '#26c6da',
    commentColor: '#607d8b',
    typeColor: '#ff8a80',
    numberColor: '#ffbc00',
    declarationColor: '#90a4ae',
    dimmedColor: '#5f6c73',
    highlightColor: '#586870',
    lineHeight: 1.5,
  },
  'io17': {
    bgColor: '#263238', // #546dfe
    textColor: '#ffffff',
    punctuationColor: '#90a4ae',
    stringAndValueColor: '#1ce8b5',
    keywordTagColor: '#00e4ff',
    commentColor: '#ff5cb4',
    typeColor: '#ff8857', // ff6d00
    numberColor: '#ffd500',
    declarationColor: '#90a4ae',
    dimmedColor: '#5f6c73',
    highlightColor: '#586870',
    lineHeight: 1.2,
  },
  'io19': {
    bgColor: '#202124',
    textColor: '#ffffff',
    punctuationColor: '#9aa0a6',
    stringAndValueColor: '#5bb974',
    keywordTagColor: '#669df6',
    commentColor: '#9aa0a6',
    typeColor: '#ee675c',
    numberColor: '#fcc934',
    declarationColor: '#fcc934',
    dimmedColor: '#5f6c73',
    highlightColor: '#4d555b',
    lineHeight: 1.2,
  },
  'flutter-interact-19': {
    bgColor: "#241e30",
    textColor: "#fafbfb",
    punctuationColor: "#8be9fd",
    stringAndValueColor: "#ffa65c",
    keywordTagColor: "#1cdec9",
    commentColor: "#808080",
    typeColor: "#d65bad",
    numberColor: "#bd93f9",
    declarationColor: "#ff8383",
    dimmedColor: "#87858e",
    highlightColor: '#425a6c',
    lineHeight: 1.2,
  },
  "angular-light": {
    bgColor: "#F5F5F5",
    textColor: "#37474F",
    punctuationColor: "#37474F",
    stringAndValueColor: "#FA2C04",
    keywordTagColor: "#0546FF",
    commentColor: "#D81B60",
    typeColor: "#F637E3",
    numberColor: "#C53929",
    declarationColor: "#0097A7",
    dimmedColor: "#BDBDBD",
    highlightColor: "#E0E0E0",
    lineHeight: 1.5,
  },
  "angular-dark": {
    bgColor: "#151417",
    textColor: "#FBFBFB",
    punctuationColor: "#D963C9",
    stringAndValueColor: "#FDAB9B",
    keywordTagColor: "#9BB5FF",
    commentColor: "#D81B60",
    typeColor: "#FBAFF4",
    numberColor: "#C53929",
    declarationColor: "#0097A7",
    dimmedColor: "#A39F9F",
    highlightColor: "#EDC7FF",
    lineHeight: 1.5,
  },
  'flutter2022': {
    bgColor: "#151718",
    textColor: "#dddddd",
    operatorColor: "#ff7e29",
    punctuationColor: "#a4b2c6",
    stringAndValueColor: "#fff275",
    keywordTagColor: "#13b9fd",
    commentColor: "#a4b2c6",
    typeColor: "#27f5dd",
    numberColor: "#ff9ea5",
    declarationColor: "#9ceaf7", // prev: variables + properties
    // spare color: ad92ff for functions + methods
    dimmedColor: "#656f7d",
    highlightColor: "#262a2b",
    lineHeight: 1.5,
  },
};
