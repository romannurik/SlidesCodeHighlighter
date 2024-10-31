/*
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { LegacyTheme } from "./themes";
import * as shiki from 'shiki';

export function legacyToShikiTheme(theme: LegacyTheme): shiki.ThemeRegistration {
  const themeName = JSON.stringify(theme);

  return {
    name: themeName,
    colors: {
      "editor.foreground": theme.textColor,
      "editor.background": theme.bgColor,
      "__dimmedColor": theme.dimmedColor,
      "editor.selectionBackground": theme.highlightColor,
    },
    semanticHighlighting: true,
    semanticTokenColors: {
      "property.annotation": theme.declarationColor,
      "annotation": theme.declarationColor,
      "class": theme.typeColor,
    },
    tokenColors: [
      {
        scope: ["comment", "punctuation.definition.comment", "string.comment"],
        settings: {
          foreground: theme.commentColor,
        },
      },
      {
        scope: [
          "punctuation",
        ],
        settings: {
          foreground: theme.operatorColor || theme.punctuationColor,
        },
      },
      {
        scope: [
          "constant",
          "entity.name.constant",
          "variable.other.constant",
          "variable.language",
        ],
        settings: {
          foreground: theme.numberColor,
        },
      },
      {
        scope: ["entity", "entity.name"],
        settings: {
          foreground: theme.typeColor,
        },
      },
      {
        scope: "variable.parameter.function",
        settings: {
          foreground: theme.textColor,
        },
      },
      {
        scope: "entity.name.tag",
        settings: {
          foreground: theme.keywordTagColor,
        },
      },
      {
        scope: "keyword",
        settings: {
          foreground: theme.keywordTagColor,
        },
      },
      {
        scope: ["storage", "storage.type"],
        settings: {
          foreground: theme.keywordTagColor,
        },
      },
      {
        scope: ["annotation"],
        settings: {
          foreground: theme.declarationColor,
        },
      },
      {
        scope: [
          "storage.modifier.package",
          "storage.modifier.import",
          "storage.type.java",
        ],
        settings: {
          foreground: theme.textColor,
        },
      },
      {
        scope: [
          "string",
          "punctuation.definition.string",
          "string punctuation.section.embedded source",
        ],
        settings: {
          foreground: theme.stringAndValueColor,
        },
      },
      {
        scope: [
          "string.quoted.double.html",
          "string.quoted.single.html",
          "string.unquoted.html",
          "punctuation.definition.string.begin.html",
          "punctuation.definition.string.end.html",
          "string.quoted.double.xml",
          "string.quoted.single.xml",
          "string.unquoted.xml",
          "punctuation.definition.string.begin.xml",
          "punctuation.definition.string.end.xml",
          "string punctuation.section.embedded source",
        ],
        settings: {
          foreground: theme.stringAndValueColor,
        },
      },
      {
        scope: "support",
        settings: {
          foreground: theme.textColor,
        },
      },
      {
        scope: "support.class",
        settings: {
          foreground: theme.typeColor,
        },
      },
      {
        scope: [
          "support.type.property-name",
          "entity.name.tag.yaml",
        ],
        settings: {
          foreground: theme.keywordTagColor,
        },
      },
      {
        scope: "meta.property-name",
        settings: {
          foreground: theme.typeColor,
        },
      },
      {
        scope: "variable",
        settings: {
          foreground: theme.declarationColor,
        },
      },
      {
        scope: "variable.other",
        settings: {
          foreground: theme.textColor,
        },
      },
      {
        scope: "string source",
        settings: {
          foreground: theme.textColor,
        },
      },
      {
        scope: "string variable",
        settings: {
          foreground: theme.typeColor,
        },
      },
      {
        scope: ["source.regexp", "string.regexp"],
        settings: {
          foreground: theme.stringAndValueColor,
        },
      },
      {
        scope: [
          "string.regexp.character-class",
          "string.regexp constant.character.escape",
          "string.regexp source.ruby.embedded",
          "string.regexp string.regexp.arbitrary-repitition",
        ],
        settings: {
          foreground: theme.stringAndValueColor,
        },
      },
      {
        scope: "string.regexp constant.character.escape",
        settings: {
          fontStyle: "bold",
          foreground: theme.stringAndValueColor,
        },
      },
      {
        scope: "support.constant",
        settings: {
          foreground: theme.numberColor,
        },
      },
      {
        scope: "support.variable",
        settings: {
          foreground: theme.typeColor,
        },
      },
      {
        scope: "meta.module-reference",
        settings: {
          foreground: theme.textColor,
        },
      },
      {
        scope: "punctuation.definition.list.begin.markdown",
        settings: {
          foreground: theme.punctuationColor || theme.operatorColor,
        },
      },
      {
        scope: ["markup.heading", "markup.heading entity.name"],
        settings: {
          fontStyle: "bold",
          foreground: theme.textColor,
        },
      },
      {
        scope: "markup.quote",
        settings: {
          foreground: theme.stringAndValueColor,
        },
      },
      {
        scope: "markup.italic",
        settings: {
          fontStyle: "italic",
          foreground: theme.textColor,
        },
      },
      {
        scope: "markup.bold",
        settings: {
          fontStyle: "bold",
          foreground: theme.textColor,
        },
      },
      {
        scope: "markup.raw",
        settings: {
          foreground: theme.keywordTagColor,
        },
      },
      {
        scope: [
          "brackethighlighter.tag",
          "brackethighlighter.curly",
          "brackethighlighter.round",
          "brackethighlighter.square",
          "brackethighlighter.angle",
          "brackethighlighter.quote",
        ],
        settings: {
          foreground: theme.punctuationColor || theme.operatorColor,
        },
      },
      {
        scope: "brackethighlighter.unmatched",
        settings: {
          foreground: theme.punctuationColor || theme.operatorColor,
        },
      },
      {
        scope: ["constant.other.reference.link", "string.other.link"],
        settings: {
          foreground: theme.stringAndValueColor,
          fontStyle: "underline",
        },
      },
    ],
  };
}
