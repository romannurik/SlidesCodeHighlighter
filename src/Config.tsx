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

import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { LegacyTheme, THEME_PROPERTIES, ThemeName } from "./themes";

export interface Config {
  code: string;
  font: string;
  tabSize: number;
  typeSize: number;
  theme: ThemeName;
  selectionTreatment: "none" | "focus" | "bold" | "highlight";
  lang?: string;
  customTheme?: LegacyTheme;
}

const DEFAULT_CONFIG: Config = {
  code: "",
  font: "Roboto Mono",
  tabSize: 4,
  typeSize: 40,
  selectionTreatment: "focus",
  theme: "light",
};

type ContextType = ReturnType<typeof useState<Config>>;

const ConfigContext = createContext<ContextType>(
  undefined as unknown as ContextType
);

// eslint-disable-next-line react-refresh/only-export-components
export function useConfig(): [Config, (updates: Partial<Config>) => void] {
  let [config, setConfig] = useContext(ConfigContext);

  let updateConfig = (updates: Partial<Config>, persist = true) => {
    setConfig((config) => {
      let newConfig = { ...DEFAULT_CONFIG, ...config, ...updates };

      if (persist) {
        // update localStorage
        if ("code" in updates) localStorage.highlighterCode = updates.code;
        if ("theme" in updates) localStorage.highlighterTheme = updates.theme;
        if ("lang" in updates)
          localStorage.highlighterLang = updates.lang || '';
        if ("font" in updates) localStorage.highlighterFont = updates.font;
        if ("tabSize" in updates)
          localStorage.highlighterTabSize = updates.tabSize;
        if ("typeSize" in updates)
          localStorage.highlighterTypeSize = updates.typeSize;
        if ("selectionTreatment" in updates)
          localStorage.highlighterSelectionTreatment =
            updates.selectionTreatment;
        if ("customTheme" in updates)
          localStorage.customTheme = JSON.stringify(updates.customTheme);

        // update url
        let p = new URLSearchParams();
        // p.set('lang', config.lang);
        if (newConfig.theme === "custom" && newConfig.customTheme) {
          p.set("theme", "custom");
          for (let [k, v] of Object.entries(newConfig.customTheme)) {
            let prop = THEME_PROPERTIES.find((s) => s.id === k);
            if (!prop) continue;
            const { type, short } = prop;
            p.set(`t.${short}`, type === "color" ? v.replace(/^#/, "") : v);
          }
        } else {
          p.set("theme", newConfig.theme);
        }
        p.set("font", newConfig.font);
        p.set("tab", String(newConfig.tabSize));
        p.set("size", String(newConfig.typeSize));
        p.set("sel", newConfig.selectionTreatment);
        window.history.replaceState("", "", "?" + p.toString());
      }
      return newConfig;
    });
  };

  return [config || DEFAULT_CONFIG, updateConfig];
}

export function ConfigWrapper({ children }: PropsWithChildren) {
  const [config, setConfig] = useState<Config | undefined>(DEFAULT_CONFIG);
  const configContext = useMemo<ContextType>(() => {
    return [config, setConfig];
  }, [config, setConfig]);

  useEffect(() => {
    // initialize config from URL and local storage
    let config = { ...DEFAULT_CONFIG };

    if (localStorage.highlighterCode)
      config.code = localStorage.highlighterCode;
    if (localStorage.highlighterTheme)
      config.theme = localStorage.highlighterTheme;
    if (localStorage.highlighterLang)
      config.lang = localStorage.highlighterLang || undefined;
    if (localStorage.highlighterFont)
      config.font = localStorage.highlighterFont;
    if (localStorage.highlighterTabSize)
      config.tabSize = Number(localStorage.highlighterTabSize);
    if (localStorage.highlighterTypeSize)
      config.typeSize = Number(localStorage.highlighterTypeSize);
    if (localStorage.highlighterSelectionTreatment)
      config.selectionTreatment = localStorage.highlighterSelectionTreatment;
    try {
      if (localStorage.customTheme)
        config.customTheme = JSON.parse(localStorage.customTheme);
    } catch (e) {
      // pass
    }

    if (window.location.search) {
      let p = Object.fromEntries(
        new URLSearchParams(window.location.search).entries()
      );
      // if (p.has('lang')) config.lang = p.get('lang');
      if ("theme" in p) {
        let theme = p["theme"];
        if (theme === "custom") {
          config.theme = "custom";
          let customTheme: Record<string, string | undefined> = {};
          for (let k of [...Object.keys(p)].filter((k) => k.startsWith("t."))) {
            let prop = THEME_PROPERTIES.find(
              (s) => s.short === k.replace(/^t\./, "")
            );
            if (!prop) continue;
            let { type, id } = prop;
            customTheme[id] = type === "color" ? "#" + p[k] : p[k];
          }
          config.customTheme = customTheme as unknown as LegacyTheme;
        }
      }
      if (p["font"]) config.font = p["font"];
      if (p["tab"]) config.tabSize = Number(p["tab"]);
      if (p["size"]) config.typeSize = Number(p["size"]);
      if (p["sel"])
        config.selectionTreatment = p["sel"] as Config["selectionTreatment"];
    }

    setConfig(config);
  }, []);

  return (
    <ConfigContext.Provider value={configContext}>
      {children}
    </ConfigContext.Provider>
  );
}
