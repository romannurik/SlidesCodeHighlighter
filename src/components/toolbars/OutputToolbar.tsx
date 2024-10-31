import { Config, useConfig } from "../../Config";
import styles from "./Toolbar.module.scss";

export function OutputToolbar() {
  let [config, updateConfig] = useConfig();

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
            >
              <option value="light">Light</option>
              <option value="light-alt">Light (alternate)</option>
              <option value="dark">Dark</option>
              <option value="dark-alt">Dark (alternate)</option>
              <option value="design-dark">Dark (design)</option>
              <option value="io17">#io17</option>
              <option value="io19">#io19</option>
              <option value="flutter-interact-19">Flutter Interact 2019</option>
              <option value="angular-light">Angular Light</option>
              <option value="angular-dark">Angular Dark</option>
              <option value="flutter2022">Flutter 2022</option>
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
              <option value="Anonymous Pro">Anonymous Pro</option>
              <option value="B612 Mono">B612 Mono</option>
              <option value="Courier Prime">Courier Prime</option>
              <option value="Cousine">Cousine</option>
              <option value="Cutive Mono">Cutive Mono</option>
              <option value="Fira Code">Fira Code</option>
              <option value="Fira Mono">Fira Mono</option>
              <option value="IBM Plex Mono">IBM Plex Mono</option>
              <option value="Inconsolata">Inconsolata</option>
              <option value="JetBrains Mono">JetBrains Mono</option>
              <option value="Major Mono Display">Major Mono Display</option>
              <option value="Nanum Gothic Coding">Nanum Gothic Coding</option>
              <option value="Nova Mono">Nova Mono</option>
              <option value="Overpass Mono">Overpass Mono</option>
              <option value="Oxygen Mono">Oxygen Mono</option>
              <option value="PT Mono">PT Mono</option>
              <option value="Roboto Mono">Roboto Mono</option>
              <option value="Share Tech Mono">Share Tech Mono</option>
              <option value="Source Code Pro">Source Code Pro</option>
              <option value="Space Mono">Space Mono</option>
              <option value="Ubuntu Mono">Ubuntu Mono</option>
              <option value="VT323">VT323</option>
            </select>
          </div>
        </label>

        <label>
          <span>Type size</span>
          <input
            style={{ width: 60 }}
            type="text"
            id="type-size"
            value={config.typeSize}
            onInput={(ev) => {
              let val = parseInt(ev.currentTarget.value, 10);
              if (!isNaN(val) && val > 4) {
                updateConfig({ typeSize: val });
              }
            }}
            onKeyDown={(ev) => {
              if (!ev.shiftKey) {
                if (ev.key == "ArrowUp" || ev.key == "ArrowDown") {
                  updateConfig({
                    typeSize:
                      parseInt(ev.currentTarget.value, 10) +
                      (ev.key == "ArrowUp" ? 1 : -1),
                  });
                  ev.preventDefault();
                }
              }
            }}
            onBlur={() => updateConfig({ typeSize: 40 })}
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
