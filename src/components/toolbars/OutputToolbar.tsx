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

import { useEffect, useState } from "react";
import { Config, useConfig } from "../../Config";
import { DEFAULT_THEME_NAMES } from "../../themes";
import styles from "./Toolbar.module.scss";

const FONTS = [
  "Anonymous Pro",
  "Azeret Mono",
  "B612 Mono",
  "Chivo Mono",
  "Courier Prime",
  "Cousine",
  "Cutive Mono",
  "DM Mono",
  "Fira Code",
  "Fira Mono",
  "Fragment Mono",
  "Geist Mono",
  "IBM Plex Mono",
  "Inconsolata",
  "JetBrains Mono",
  "Kode Mono",
  "Lekton",
  "Martian Mono",
  "Nanum Gothic Coding",
  "Nova Mono",
  "Overpass Mono",
  "Oxygen Mono",
  "PT Mono",
  "Reddit Mono",
  "Red Hat Mono",
  "Roboto Mono",
  "Share Tech Mono",
  "Sometype Mono",
  "Sono",
  "Source Code Pro",
  "Space Mono",
  "Spline Sans Mono",
  "Ubuntu Mono",
  "Victor Mono",
  "VT323",
].sort();

export function OutputToolbar() {
  let [config, updateConfig] = useConfig();
  let [typeSize, setTypeSize] = useState<string>();

  useEffect(() => {
    let val = parseInt(typeSize || "", 10);
    if (!isNaN(val) && val > 4) {
      updateConfig({ typeSize: val });
    }
  }, [typeSize, updateConfig]);

  return (
    <>
      <div className={styles.titleBar}>Copy the formatted code below</div>
      <div className={styles.toolbar}>
        <label>
          <span>Theme</span>
          <div className={styles.selectWrapper}>
            <select
              id="theme"
              value={config.theme}
              onInput={(ev) =>
                updateConfig({
                  theme: ev.currentTarget.value as Config["theme"],
                })
              }
              onKeyDown={(ev) => {
                if (
                  ev.altKey &&
                  (ev.key === "ArrowUp" || ev.key === "ArrowDown")
                ) {
                  let list = Object.entries(DEFAULT_THEME_NAMES).sort((a, b) =>
                    a[1].localeCompare(b[1])
                  );
                  let delta = ev.key === "ArrowUp" ? -1 : 1;
                  let idx = list.findIndex(
                    (a) => a[0] === ev.currentTarget.value
                  );
                  updateConfig({
                    theme: list[
                      (idx + delta + list.length) % list.length
                    ][0] as Config["theme"],
                  });
                  ev.preventDefault();
                }
              }}
            >
              {Object.entries(DEFAULT_THEME_NAMES)
                .sort((a, b) => a[1].localeCompare(b[1]))
                .map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              <option value="custom">Custom</option>
            </select>
          </div>
        </label>

        <label>
          <span>Font</span>
          <div className={styles.selectWrapper}>
            <select
              id="font"
              value={config.font}
              onInput={(ev) =>
                updateConfig({
                  font: ev.currentTarget.value,
                })
              }
            >
              {FONTS.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>
        </label>

        <label>
          <span>Type size</span>
          <input
            style={{ width: 60 }}
            type="text"
            id="type-size"
            value={typeSize ?? config.typeSize}
            onInput={(ev) => {
              setTypeSize(ev.currentTarget.value);
            }}
            onKeyDown={(ev) => {
              if (
                !ev.shiftKey &&
                (ev.key === "ArrowUp" || ev.key === "ArrowDown")
              ) {
                let val = parseInt(ev.currentTarget.value, 10);
                if (isNaN(val)) return;
                setTypeSize(String(val + (ev.key == "ArrowUp" ? 1 : -1)));
                ev.preventDefault();
              }
            }}
            onBlur={() => {
              setTypeSize(undefined);
            }}
          />
        </label>

        <label>
          <span>Selected text</span>
          <div className={styles.selectWrapper}>
            <select
              id="selection-treatment"
              style={{ minWidth: 148 }}
              value={config.selectionTreatment}
              onInput={(ev) =>
                updateConfig({
                  selectionTreatment: ev.currentTarget
                    .value as Config["selectionTreatment"],
                })
              }
            >
              <option value="none">Do nothing</option>
              <option value="focus">Focus</option>
              <option value="bold">Bold</option>
              <option value="highlight">Highlight</option>
            </select>
          </div>
        </label>
      </div>
    </>
  );
}
