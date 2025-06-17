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
import { useState } from "react";
import { useConfig } from "../Config";
import {
  DEFAULT_LEGACY_THEMES,
  isVscTheme,
  LegacyTheme,
  THEME_PROPERTIES
} from "../themes";
import styles from "./CustomThemeEditor.module.scss";
import { CustomThemeImportExport } from "./CustomThemeImportExport";
import { CustomToolbar } from "./toolbars/CustomToolbar";

export function CustomThemeEditor({ className }: { className?: string }) {
  let [config, updateConfig] = useConfig();
  let [customThemeImportExportOpen, setCustomThemeImportExportOpen] = useState(false);

  let vsc = isVscTheme(config.customTheme || {});
  let customTheme: LegacyTheme = {
    ...DEFAULT_LEGACY_THEMES.light,
    ...(config.customTheme || {}),
  };

  if (config.theme !== "custom") {
    return null;
  }

  return (
    <div className={cn(className, styles.customThemeArea)}>
      {customThemeImportExportOpen &&
        <CustomThemeImportExport
          open
          onClose={() => setCustomThemeImportExportOpen(false)} />}

      <CustomToolbar heading="Custom theme">
        <button
          onClick={() => setCustomThemeImportExportOpen(true)}
        >
          Import/export
        </button>
        <button
          onClick={() => {
            updateConfig({ customTheme: { ...DEFAULT_LEGACY_THEMES.light } });
          }}
        >
          Reset
        </button>
      </CustomToolbar>
      <div className={styles.customThemeEditor}>
        {vsc && <div className={styles.customThemeEditorEmpty}>
          Your custom theme is a full VSCode theme, which isn't editable in this view
        </div>}
        {!vsc && THEME_PROPERTIES.map((prop) => {
          let hexColor = String(
            customTheme[prop.id] || "#000000"
          ).toUpperCase();
          return (
            <div key={prop.id} className={styles.customThemeProp}>
              <label>
                <input
                  type="color"
                  value={hexColor}
                  onInput={(ev) => {
                    customTheme[prop.id] = sanitize_(ev.currentTarget.value);
                    updateConfig({ customTheme });
                  }}
                />
                <input
                  type="text"
                  value={hexColor}
                  onInput={(ev) => {
                    customTheme[prop.id] = sanitize_(ev.currentTarget.value);
                    updateConfig({ customTheme });
                  }}
                />
                <span>{prop.name}</span>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

let sanitize_ = (s: string) => s.replace(/^\s*|\s*$/g, "").toUpperCase();
