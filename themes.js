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

import {materialColor} from './material-colors.js';


export const THEME_PROPERTIES = [
  { id: 'bgColor', name: 'Background' },
  { id: 'textColor', name: 'Plain text' },
  { id: 'punctuationColor', name: 'Punctuation' },
  { id: 'stringAndValueColor', name: 'Strings, values' },
  { id: 'keywordTagColor', name: 'Keywords, tags' },
  { id: 'commentColor', name: 'Comments' },
  { id: 'typeColor', name: 'Types' },
  { id: 'numberColor', name: 'Numbers' },
  { id: 'declarationColor', name: 'Declarations' },
  { id: 'lineHeight', name: 'Line height' },
];

const SEL_PLAIN_TEXT = '.pln';
const SEL_PUNCTUATION = '.pun, .opn, .clo'; // punc, lisp open bracket, lisp close bracket
const SEL_STRING_VALUE = '.str, .atv'; // string content and attribute value
const SEL_KEYWORD_TAG = '.kwd, .tag'; // keyword, html tag
const SEL_COMMENT = '.com';
const SEL_TYPE = '.typ, .atn'; // a type name or attribute name
const SEL_LITERAL = '.lit'; // literal value
const SEL_DECLARATION = '.dec, .var'; // declaration (like doctype), variable name

export function setTheme(theme, typeSize) {
  let {bgColor, textColor, punctuationColor, stringAndValueColor,
       keywordTagColor, commentColor, typeColor, numberColor,
       declarationColor, lineHeight} = theme;
  lineHeight = lineHeight || 1.5;
  let css = `
    #output pre {
      line-height: ${lineHeight * typeSize}px;
    }
    #output::after {
      /* to avoid background color being copied to clipboard */
      background-color: ${bgColor};
    }
    ${SEL_PLAIN_TEXT} { color: ${textColor}; }
    ${SEL_PUNCTUATION} { color: ${punctuationColor}; }
    ${SEL_STRING_VALUE} { color: ${stringAndValueColor}; }
    ${SEL_KEYWORD_TAG} { color: ${keywordTagColor}; }
    ${SEL_COMMENT} { color: ${commentColor}; }
    ${SEL_TYPE} { color: ${typeColor}; }
    ${SEL_LITERAL} { color: ${numberColor}; }
    ${SEL_DECLARATION} { color: ${declarationColor}; }
  `;

  $('[theme-rules]').remove();

  $('<style>')
      .attr('theme-rules', true)
      .text(css)
      .appendTo(document.body);
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
    declarationColor: materialColor('indigo', '500'),
    lineHeight: 1.5,
  },
  'light-alt': {
    bgColor: '#eee',
    textColor: '#000',
    punctuationColor: '#a3a3a3',
    stringAndValueColor: '#0f9d58',
    keywordTagColor: '#4285f4',
    commentColor: '#999',
    typeColor: '#673ab7',
    numberColor: '#db4437',
    // attrNameColor: #e91e63,
    declarationColor: '#e67c73',
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
    lineHeight: 1.5,
  },
  'dark-alt': {
    bgColor: '#000',
    textColor: '#fff',
    punctuationColor: '#a3a3a3',
    stringAndValueColor: '#57bb8a',
    keywordTagColor: '#7baaf7',
    commentColor: '#aaa',
    typeColor: '#ff8a65', // alt #f06292
    numberColor: '#f4b400',
    declarationColor: '#e67c73',
    lineHeight: 1.5,
  },
  'design-dark': {
    bgColor: '#263238',
    textColor: '#fff',
    punctuationColor: '#90a4ae',
    stringAndValueColor: '#00bfa4',
    keywordTagColor: '#26c6da',
    commentColor: '#607d8b',
    typeColor: '#ff8a80',
    numberColor: '#ffbc00',
    declarationColor: '#90a4ae',
    lineHeight: 1.5,
  },
  'io17': {
    bgColor: '#263238', // #546dfe
    textColor: '#fff',
    punctuationColor: '#90a4ae',
    stringAndValueColor: '#1ce8b5',
    keywordTagColor: '#00e4ff',
    commentColor: '#ff5cb4',
    typeColor: '#ff8857', // ff6d00
    numberColor: '#ffd500',
    declarationColor: '#90a4ae',
    lineHeight: 1.2,
  },
  'io19': {
    bgColor: '#202124',
    textColor: '#fff',
    punctuationColor: '#9aa0a6',
    stringAndValueColor: '#5bb974',
    keywordTagColor: '#669df6',
    commentColor: '#9aa0a6',
    typeColor: '#ee675c',
    numberColor: '#fcc934',
    declarationColor: '#fcc934',
    lineHeight: 1.2,
  },
  'flutter-interact-19': {
    "bgColor":"#241e30",
    "textColor":"#FAFBFB",
    "punctuationColor":"#8BE9FD",
    "stringAndValueColor":"#FF8383",
    "keywordTagColor":"#1CDEC9",
    "commentColor":"#808080",
    "typeColor":"#FF5722",
    "numberColor":"#CE63FF",
    "declarationColor":"#B93C5D",
    "lineHeight":1.2,
  }
};
