import { THEME_PROPERTIES } from "../themes";
import styles from "./CustomThemeEditor.module.scss";

export function CustomThemeEditor() {
  return (
    <div className={styles.customThemeArea}>
      <div className={styles.titleBar}>Custom theme</div>
      <div className={styles.toolbar}>
        <button className={styles.customThemeImportExport}>
          Import/export
        </button>
        <button className={styles.customThemeReset}>Reset</button>
      </div>
      <div className={styles.customThemeEditor} />
    </div>
  );
}

setupCustomThemeEditor();

function setupCustomThemeEditor() {
  let sanitize_ = (s) => s.replace(/^\s*|\s*$/g, "").toUpperCase();

  let rebuildCustomThemeProperties = () => {
    let $customThemeEditor = $(".custom-theme-editor").empty();
    for (let prop of THEME_PROPERTIES.filter((s) => !s.hideEditor)) {
      let $prop = $("<div>")
        .addClass("custom-theme-prop")
        .appendTo($customThemeEditor);
      let $label = $("<label>").appendTo($prop);
      let hexColor = String(
        config.customTheme[prop.id] || "#000000"
      ).toUpperCase();
      let $textInput, $colorInput;
      $colorInput = $("<input>")
        .attr("type", "color")
        .val(hexColor)
        .on("input", () => {
          config.customTheme[prop.id] = sanitize_($colorInput.val());
          $textInput.val(config.customTheme[prop.id]);
          localStorage.customTheme = JSON.stringify(config.customTheme);
          updateConfigUrl();
          updateOutputArea();
        })
        .appendTo($label);
      $textInput = $("<input>")
        .attr("type", "text")
        .val(hexColor)
        .on("input", () => {
          config.customTheme[prop.id] = sanitize_($textInput.val());
          $colorInput.val(config.customTheme[prop.id]);
          localStorage.customTheme = JSON.stringify(config.customTheme);
          updateConfigUrl();
          updateOutputArea();
        })
        .appendTo($label);
      $label.append(`<span>${prop.name}</span>`); // text
    }
  };

  rebuildCustomThemeProperties();

  $(".custom-theme-import-export").on("click", () => {
    let currentJSON = JSON.stringify(config.customTheme);
    let newJSON = window.prompt(
      "Copy the below JSON or paste new JSON for your custom theme.",
      currentJSON
    );
    if (newJSON && newJSON != currentJSON) {
      try {
        config.customTheme = Object.assign(
          {},
          DEFAULT_THEMES["light"],
          JSON.parse(newJSON) || {}
        );
        localStorage.customTheme = JSON.stringify(config.customTheme);
        updateConfigUrl();
        updateOutputArea();
        rebuildCustomThemeProperties();
      } catch (e) {
        alert("Error parsing the JSON: " + e);
      }
    }
  });

  $(".custom-theme-reset").on("click", () => {
    config.customTheme = { ...DEFAULT_THEMES["light"] };
    localStorage.customTheme = JSON.stringify(config.customTheme);
    updateConfigUrl();
    updateOutputArea();
    rebuildCustomThemeProperties();
  });
}
