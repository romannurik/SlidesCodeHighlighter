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
import { bundledLanguagesInfo } from "shiki";
import { useConfig } from "../../Config";
import styles from "./Toolbar.module.scss";

export function InputToolbar() {
  let [config, updateConfig] = useConfig();

  return (
    <>
      <div className={styles.titleBar}>Paste code below</div>
      <div className={styles.toolbar}>
        <label>
          <span>Language</span>
          <div className={styles.inputDatalistWrapper}>
            <select
              style={{ minWidth: 150 }}
              name="lang"
              className={cn({
                [styles.isInvalid]:
                  config.lang &&
                  !bundledLanguagesInfo.find((c) => c.id === config.lang),
              })}
              value={config.lang || ""}
              onChange={(ev) => updateConfig({ lang: ev.currentTarget.value })}
            >
              <option value="">(auto)</option>
              {bundledLanguagesInfo
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
            </select>
          </div>
        </label>

        <label>
          <span>Tab size</span>
          <div className={styles.selectWrapper}>
            <select
              id="tab-size"
              style={{ minWidth: 80 }}
              value={config.tabSize}
              onInput={(ev) =>
                updateConfig({ tabSize: Number(ev.currentTarget.value) })
              }
            >
              <option value="2">2</option>
              <option value="4">4</option>
            </select>
          </div>
        </label>
      </div>
    </>
  );
}
