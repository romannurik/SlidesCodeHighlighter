import { useConfig } from "../Config";
import cn from "classnames";
import {
  DEFAULT_LEGACY_THEMES,
  LegacyTheme,
  THEME_PROPERTIES,
} from "../themes";
import styles from "./CustomThemeEditor.module.scss";
import { CustomToolbar } from "./toolbars/CustomToolbar";

export function CustomThemeEditor({ className }: { className?: string }) {
  let [config, updateConfig] = useConfig();

  let customTheme: LegacyTheme = {
    ...DEFAULT_LEGACY_THEMES.light,
    ...(config.customTheme || {}),
  };

  if (config.theme !== "custom") {
    return null;
  }

  return (
    <div className={cn(className, styles.customThemeArea)}>
      <CustomToolbar heading="Custom theme">
        <button
          onClick={() => {
            let theme: Partial<LegacyTheme> = config.customTheme || {};
            delete theme['legacy'];
            delete theme['name'];
            let currentJSON = JSON.stringify(config.customTheme);
            let newJSON = window.prompt(
              "Copy the below JSON or paste new JSON for your custom theme.",
              currentJSON
            );
            if (newJSON && newJSON != currentJSON) {
              try {
                updateConfig({
                  customTheme: {
                    ...DEFAULT_LEGACY_THEMES.light,
                    ...(JSON.parse(newJSON) || {}),
                  },
                });
              } catch (e) {
                alert("Error parsing the JSON: " + e);
              }
            }
          }}
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
        {THEME_PROPERTIES.map((prop) => {
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
