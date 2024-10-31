import cn from "classnames";
import * as shiki from "shiki";
import { useConfig } from "../../Config";
import styles from "./Toolbar.module.scss";

const ALL_LANGUAGES = new Set([...Object.keys(shiki.bundledLanguages)]);

export function InputToolbar() {
  let [config, updateConfig] = useConfig();

  return (
    <>
      <div className={styles.titleBar}>Paste code below</div>
      <div className={styles.toolbar}>
        <label>
          <span>Language</span>
          <div className={styles.inputDatalistWrapper}>
            <input
              style={{ minWidth: 150 }}
              name="lang"
              list="lang-datalist"
              type="text"
              className={cn({
                [styles.isInvalid]:
                  config.lang && !ALL_LANGUAGES.has(config.lang),
              })}
              placeholder="(auto)"
              autoCapitalize="off"
              spellCheck="false"
              value={config.lang || ""}
              onInput={(ev) => updateConfig({ lang: ev.currentTarget.value })}
            />
            <datalist id="lang-datalist">
              {[...ALL_LANGUAGES.values()].sort().map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </div>
        </label>

        <label>
          <span>Tab size</span>
          <div className={styles.selectWrapper}>
            <select
              id="tab-size"
              style={{ minWidth: 80 }}
              value={config.tabSize}
              onInput={(ev) => updateConfig({ tabSize: Number(ev.currentTarget.value) })}
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
