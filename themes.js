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
];


export function setTheme(theme) {
  let {bgColor, textColor, punctuationColor, stringAndValueColor,
       keywordTagColor, commentColor, typeColor, numberColor,
       declarationColor} = theme;

  let css = `
    #output::after {
      /* to avoid background color being copied to clipboard */
      background-color: ${bgColor};
    }
    .pln { color: ${textColor}; }  /* plain text */
    .clo { color: ${punctuationColor}; } /* punctuation, lisp open bracket, lisp close bracket */
    /*.fun { color: $functionColor; }  /* a function name (seems to be unused) */
    .str,
    .atv { color: ${stringAndValueColor}; }  /* string content and attribute value */
    .kwd,
    .tag { color: ${keywordTagColor};  }  /* a keyword or tag */
    .com { color: ${commentColor}; }  /* a comment */
    .typ,
    .atn { color: ${typeColor}; }  /* a type name or xq variable */
    .lit { color: ${numberColor}; }  /* a literal value */
    .pun,
    .opn,
    .dec,
    .var { color: ${declarationColor}; }  /* a declaration like doctype, and variable name */
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
    declarationColor: materialColor('yellow', '700')
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
  }
};