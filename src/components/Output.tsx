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

import cn from "classnames";
import { useContext, useEffect, useState } from "react";
import * as shiki from "shiki";
import tinycolor from "tinycolor2";
import WebFont from "webfontloader";
import { AppState, AppStateContext } from "../AppState";
import { cleanupCode } from "../cleanup-code";
import { Config, useConfig } from "../Config";
import { GLOBAL_OUTPUT_CONTAINER_CLASS, resolveTheme } from "../themes";
import { htmlEscape } from "../util";
import styles from "./Output.module.scss";

const OUTPUT_PADDING = 20;
const FONT_PROMISES: Record<string, Promise<void>> = {};

export function Output() {
  let [node, setNode] = useState<HTMLDivElement>();
  let [html, setHtml] = useState("");
  let [bgColor, setBgColor] = useState("");
  let [preMeasure, setPreMeasure] = useState({ scale: 1, width: 0 });
  let [config] = useConfig();
  let appState = useContext(AppStateContext);

  useEffect(() => {
    if (!node) return;
    let cancel = false;

    let rehighlight = async () => {
      let theme = await resolveTheme(config);
      let pre = await codeToHighlightedPre(theme, config, appState);
      if (cancel) return;
      setPreMeasure(measurePre(pre, node));
      setHtml(pre.innerHTML);
      setBgColor(theme.colors?.["editor.background"] || "");
    };

    if (!FONT_PROMISES[config.font]) {
      FONT_PROMISES[config.font] = new Promise((resolve) => {
        WebFont.load({
          google: {
            families: [`${config.font}:400,700,400italic,700italic`],
          },
          active: () => {
            resolve();
          },
        });
      });
    }

    FONT_PROMISES[config.font].then(rehighlight);
    document.fonts.ready.then(rehighlight);
    window.addEventListener("resize", rehighlight);

    return () => {
      cancel = true;
      window.removeEventListener("resize", rehighlight);
    };
  }, [node, config, appState]);

  return (
    <div
      className={cn(GLOBAL_OUTPUT_CONTAINER_CLASS, styles.output, {
        "has-highlights": appState.selections.length,
      })}
      style={{
        backgroundColor: bgColor,
      }}
      ref={(node) => setNode(node || undefined)}
      data-seltreat={config.selectionTreatment || ""}
      onClick={(ev) => {
        let selection = window.getSelection();
        let range = document.createRange();
        let pre = ev.currentTarget.querySelector("pre");
        if (pre) range.selectNodeContents(pre);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }}
    >
      <pre
        style={{
          width: preMeasure.width,
          transform: `translate(-50%, -50%) scale(${preMeasure.scale})`,
          fontFamily: config.font,
          fontSize: `${config.typeSize}px`,
          lineHeight: `${config.typeSize * 1.5}px`,
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

let highlighterPromise: Promise<shiki.Highlighter>;

async function codeToHighlightedPre(
  theme: shiki.ThemeRegistration,
  config: Config,
  appState: AppState
) {
  // build pre element
  let pre = document.createElement("pre");
  pre.style.fontFamily = config.font;
  pre.style.fontSize = `${config.typeSize}px`;
  pre.style.lineHeight = `${config.typeSize * 1.5}px`;
  pre.style.backgroundColor = "transparent";

  let lang = config.lang || (/\s*</.test(config.code) ? "html" : "js");

  let code = cleanupCode(config.code, config.tabSize).code;

  if (!highlighterPromise) {
    highlighterPromise = shiki.createHighlighter({
      themes: [],
      langs: [],
    });
  }
  let highlighter = await highlighterPromise;

  try {
    if (!highlighter.getLoadedLanguages().includes(lang))
      await highlighter.loadLanguage(lang as shiki.BuiltinLanguage);
  } catch (e) {
    console.warn(e);
    lang = "plaintext";
  }

  let themeName = theme.name || '';
  try {
    if (!highlighter.getLoadedThemes().includes(themeName))
      await highlighter.loadTheme(theme);
  } catch (e) {
    themeName = 'light-plus' satisfies shiki.BundledTheme;
  }

  pre.innerHTML = highlighter
    .codeToHtml(code, {
      lang,
      theme: themeName,
    })
    .replace(/<\/?(pre|code).*?>/g, "");

  if (config.selectionTreatment && appState.selections.length) {
    highlightSelection(pre, theme, config, appState);
  }

  return pre;
}

function highlightSelection(
  preRoot: HTMLPreElement,
  theme: shiki.ThemeRegistration,
  config: Config,
  appState: AppState
) {
  let colors = theme.colors || {};
  let fg = colors["editor.foreground"] || colors["foreground"];
  let bg = colors["editor.background"];
  let dim = colors["__dimmedColor"] || tinycolor.mix(fg, bg, 75).toRgbString();
  let hili =
    colors["editor.selectionBackground"] ||
    colors["editor.selectionHighlightBackground"] ||
    tinycolor.mix(fg, bg, 75).toRgbString();
  let selTreatment = config.selectionTreatment;

  for (let { start, end } of appState.selections) {
    let childStartPos = 0;

    let traverse_ = (parent: Node, inheritAttrs: Record<"style", string>) => {
      for (let child of Array.from(parent.childNodes)) {
        let childAttrs = {
          style: (child as HTMLSpanElement).getAttribute?.("style") || "",
        };

        if (
          child.childNodes.length >= 2 ||
          (child.childNodes.length >= 1 &&
            child.childNodes[0].nodeType !== Node.TEXT_NODE)
        ) {
          // this is a complex element, traverse it instead of treating it
          // as a leaf node
          traverse_(child, {
            ...inheritAttrs,
            ...childAttrs,
          });
          continue;
        }

        let childContent = child.textContent || "";
        let childEndPos = childStartPos + childContent.length;

        if (start < childEndPos && end >= childStartPos) {
          // some overlap
          let startInChild = Math.max(0, start - childStartPos);
          let endInChild = Math.min(
            childContent.length,
            childContent.length - (childEndPos - end)
          );

          let respan = (mark: boolean, start: number, end: number) => {
            if (start === end) {
              return null;
            }

            let f = document.createElement(
              mark ? "mark" : "span"
            ) as HTMLSpanElement;
            f.setAttribute(
              "style",
              childAttrs.style || inheritAttrs.style || ""
            );
            switch (selTreatment) {
              case "bold":
                if (mark) f.style.fontWeight = "bold";
                break;
              case "highlight":
                if (mark) f.style.backgroundColor = hili;
                break;
            }
            f.innerHTML = htmlEscape(childContent.substring(start, end));
            return f;
          };

          child.replaceWith(
            ...[
              respan(false, 0, startInChild),
              respan(true, startInChild, endInChild),
              respan(false, endInChild, childContent.length),
            ].filter((s) => !!s)
          );
        }

        childStartPos = childEndPos;
      }
    };

    traverse_(preRoot, { style: "" });
  }

  if (selTreatment === "focus") {
    preRoot
      .querySelectorAll<HTMLSpanElement>("span:not(.line)")
      .forEach((s) => (s.style.color = dim));
  }
}

function measurePre(
  pre: HTMLPreElement,
  container: HTMLDivElement
): {
  width: number;
  scale: number;
} {
  // find width by measuring the longest line
  let { width, height } = measureNaturalPreSize(pre);
  width = Math.max(1, width);
  height = Math.max(1, height);

  // center and scale the pre in the output area
  let scale = Math.min(
    1,
    Math.min(
      (container.offsetWidth - OUTPUT_PADDING * 2) / width,
      (container.offsetHeight - OUTPUT_PADDING * 2) / height
    )
  );

  return { scale, width };
}

function measureNaturalPreSize(pre: HTMLPreElement) {
  let preClone = pre.cloneNode(true) as HTMLPreElement;
  preClone.style.position = "fixed";
  preClone.style.left = "-10000px";
  preClone.style.top = "0";
  preClone.style.height = "auto";
  preClone.style.display = "inline-block";
  document.body.appendChild(preClone);

  let width = preClone.offsetWidth;
  let height = preClone.offsetHeight;
  preClone.remove();
  return { width, height };
}
