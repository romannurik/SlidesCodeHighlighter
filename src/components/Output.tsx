import cn from "classnames";
import { useContext, useEffect, useState } from "react";
import * as shiki from "shiki";
import WebFont from "webfontloader";
import { AppState, AppStateContext } from "../AppState";
import { cleanupCode } from "../cleanup-code";
import { Config, useConfig } from "../Config";
import {
  GLOBAL_OUTPUT_CONTAINER_CLASS,
  resolveTheme,
  setTheme,
} from "../themes";
import { htmlEscape } from "../util";
import styles from "./Output.module.scss";

const OUTPUT_PADDING = 20;
const FONT_PROMISES: Record<string, Promise<void>> = {};

export function Output() {
  let [node, setNode] = useState<HTMLDivElement>();
  let [html, setHtml] = useState("");
  let [preMeasure, setPreMeasure] = useState({ scale: 1, width: 0 });
  let [config] = useConfig();
  let appState = useContext(AppStateContext);

  useEffect(() => {
    if (!node) return;

    let rehighlight = async () => {
      let theme = await resolveTheme(config);
      setTheme(theme);
      let pre = await codeToHighlightedPre(theme, config, appState);
      setPreMeasure(measurePre(pre, node));
      setHtml(pre.innerHTML);
    };

    window.addEventListener("resize", rehighlight);
    document.fonts.ready.then(rehighlight);

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

    return () => {
      window.removeEventListener("resize", rehighlight);
    };
  }, [node, config, appState]);

  return (
    <div
      className={cn(GLOBAL_OUTPUT_CONTAINER_CLASS, styles.output, {
        "has-highlights": appState.selections.length,
      })}
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
          fontSize: config.typeSize,
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
  pre.style.lineHeight = "1.4";
  pre.style.backgroundColor = "transparent";

  let lang = config.lang || (/\s*</.test(config.code) ? "markup" : "js");

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
    if (!highlighter.getLoadedThemes().includes(theme.name!))
      await highlighter.loadTheme(theme);
  } catch (e) {
    console.warn(e);
    lang = "plaintext";
  }

  pre.innerHTML = highlighter
    .codeToHtml(code, {
      lang,
      theme: theme.name || "",
    })
    .replace(/<\/?(pre|code).*?>/g, "");

  if (config.selectionTreatment) {
    highlightSelection(pre, appState);
  }

  return pre;
}

function highlightSelection(preRoot: HTMLPreElement, appState: AppState) {
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

          let makeSub = (tag: "span" | "mark", start: number, end: number) => {
            if (start == end) {
              return null;
            }

            let f = document.createElement(tag);
            f.setAttribute(
              "style",
              childAttrs.style || inheritAttrs.style || ""
            );
            f.innerHTML = htmlEscape(childContent.substring(start, end));
            return f;
          };

          child.replaceWith(
            ...[
              makeSub("span", 0, startInChild),
              makeSub("mark", startInChild, endInChild),
              makeSub("span", endInChild, childContent.length),
            ].filter((s) => !!s)
          );
        }

        childStartPos = childEndPos;
      }
    };

    traverse_(preRoot, { style: "" });
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
