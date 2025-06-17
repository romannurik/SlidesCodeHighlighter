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
import JSON5 from 'json5';
import { useEffect, useMemo, useRef, useState } from "react";
import { useConfig } from "../Config";
import { DEFAULT_LEGACY_THEMES, isVscTheme } from "../themes";
import styles from "./CustomThemeImportExport.module.scss";

export function CustomThemeImportExport({
  open,
  onClose
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  let dialogRef = useRef<HTMLDialogElement>(null);
  let [config, updateConfig] = useConfig();
  const themeText = useMemo(() => {
    let copy = {...(config.customTheme || {})} as any;
    if ('legacy' in copy) delete copy['legacy'];
    if ('name' in copy) delete copy['name'];
    return JSON.stringify(copy, null, 2);
  }, []);
  let [val, setVal] = useState(themeText /* default only */);
  let [parseError, setParseError] = useState(false);

  let isDirty = themeText !== val;

  useEffect(() => {
    try {
      JSON5.parse(val);
      setParseError(false);
    } catch (e) {
      setParseError(true);
    }
  }, [val]);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, [open]);

  let importTheme = () => {
    try {
      const newThemeObj = JSON5.parse(val);
      if (isVscTheme(newThemeObj)) {
        // this is a vscode theme
        updateConfig({ customTheme: newThemeObj });
      } else {
        updateConfig({
          customTheme: {
            ...DEFAULT_LEGACY_THEMES.light,
            ...newThemeObj,
          },
        });
      }
      onClose?.();
    } catch (e) {
      alert("Error parsing the JSON: " + e);
    }
  };

  return (
    <dialog ref={dialogRef} onClose={() => onClose?.()} className={cn(styles.customThemeImportExport)}>
      <p>To export, copy the code below. To import, paste your theme below. VSCode themes are supported.</p>
      <textarea className={cn({ [styles.hasError]: parseError })} autoFocus spellCheck="false" autoCorrect="false" value={val} onInput={ev => setVal(ev.currentTarget.value)} />
      <div className={styles.actions}>
        {isDirty && <button disabled={parseError} type="submit" onClick={() => importTheme()}>Import</button>}
        {!isDirty && <button type="submit" onClick={() => navigator.clipboard.writeText(val)}>Copy to Clipboard</button>}
        <button onClick={() => onClose?.()}>{isDirty ? 'Cancel' : 'Close'}</button>
      </div>
    </dialog >
  );
}
