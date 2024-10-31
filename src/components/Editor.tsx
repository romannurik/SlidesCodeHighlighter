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

import * as monaco from "monaco-editor"; // TODO: figure out how to minify the bundle
import { useContext, useEffect, useState } from "react";
import { AppStateContext, Selection } from "../AppState";
import { cleanupCode } from "../cleanup-code";
import { useConfig } from "../Config";
import styles from "./Editor.module.scss";

export function Editor() {
  return navigator.userAgent.match(/iP(hone|od|ad)|Android/) ? (
    <SimpleEditor />
  ) : (
    <MonacoEditor />
  );
}

function SimpleEditor() {
  let [config, updateConfig] = useConfig();

  // Monaco editor is pretty broken on mobile, just use a <textarea>
  return (
    <textarea
      className={styles.plainEditor}
      autoCapitalize="off"
      spellCheck="false"
      value={config.code}
      onChange={(ev) => updateConfig({ code: ev.currentTarget.value })}
    />
  );
}

function MonacoEditor() {
  let [config, updateConfig] = useConfig();
  let appState = useContext(AppStateContext);
  let [editorNode, setEditorNode] = useState<HTMLDivElement>();
  let [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>();

  useEffect(() => {
    if (!editorNode) return;
    let editor = monaco.editor.create(editorNode, {
      automaticLayout: true,
      minimap: {
        enabled: false,
      },
      language: "plaintext",
      value: config.code,
      theme: "vs",
      fontSize: 14,
      fontLigatures: true,
      padding: {
        top: 8,
      },
      fontFamily: '"Roboto Mono"',
    });
    editor.onDidChangeModelContent(() => {
      updateConfig({ code: editor.getValue() });
    });
    setEditor(editor);

    return () => {
      editor.dispose();
      setEditor(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorNode]);

  useEffect(() => {
    let model = editor?.getModel();
    if (!model) return;
    if (model.getValue() === config.code) return;
    model.setValue(config.code);
  }, [editor, config.code]);

  useEffect(() => {
    if (!editor) return;
    editor.updateOptions({
      fontFamily: `"${config.font}"`,
      tabSize: config.tabSize,
      detectIndentation: false,
    });
  }, [editor, config.tabSize, config.font]);

  useEffect(() => {
    if (!editor) return;

    let updateSelection = () => {
      let selections: Selection[] = [];
      for (let range of editor.getSelections() || []) {
        let start = rangeToCharPos(config.code, config.tabSize, {
          row: range.startLineNumber - 1,
          column: range.startColumn - 1,
        });
        let end = rangeToCharPos(config.code, config.tabSize, {
          row: range.endLineNumber - 1,
          column: range.endColumn - 1,
        });

        if (end === start) {
          continue;
        }

        selections.push({ start, end });
      }

      appState.update({ selections });
    };

    let d = [
      editor.onDidChangeCursorPosition(updateSelection),
      editor.onDidChangeCursorSelection(updateSelection),
    ];

    return () => {
      d.forEach((d) => d.dispose());
    };
  }, [editor, appState, config.code, config.tabSize]);

  return (
    <div
      ref={(node) => setEditorNode(node || undefined)}
      className={styles.editor}
    />
  );
}

function rangeToCharPos(
  rawCode: string,
  tabSize: number,
  { row, column }: { row: number; column: number }
) {
  const { code, leadingEmptyLines, commonIndent } = cleanupCode(
    rawCode,
    tabSize
  );
  return (
    code
      .split(/\r?\n/)
      .slice(0, row - leadingEmptyLines)
      .reduce((a, r) => a + r.length + 1, 0) +
    Math.max(
      0,
      ((rawCode.split(/\n/)[row] || "").substring(0, column).match(/\t/g) || [])
        .length *
        (tabSize - 1) +
        column -
        commonIndent
    )
  );
}
