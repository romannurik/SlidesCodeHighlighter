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
