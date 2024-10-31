import { useEffect, useState } from "react";
import { ThemeRegistration } from "shiki";
import styles from "./App.module.scss";
import { Editor } from "./components/Editor";
import { MessageList } from "./components/MessageList";
import { Output } from "./components/Output";
import { InputToolbar } from "./components/toolbars/InputToolbar";
import { OutputToolbar } from "./components/toolbars/OutputToolbar";
import { WarningMessages } from "./components/WarningMessages";
import { useConfig } from "./Config";
import { resolveTheme } from "./themes";
import { CustomThemeEditor } from "./components/CustomThemeEditor";

function App() {
  let [config] = useConfig();
  let [currentTheme, setCurrentTheme] = useState<ThemeRegistration>();
  useEffect(() => {
    (async () => {
      let theme = await resolveTheme(config);
      setCurrentTheme(theme);
    })();
  }, [config]);

  return (
    <>
      <div className={styles.editArea}>
        <InputToolbar />
        <Editor />
        <WarningMessages />
      </div>
      <div className={styles.outputArea}>
        <OutputToolbar />
        <Output />
        <MessageList
          className={styles.messages}
          messages={[
            {
              type: "info",
              message:
                "For best results, copy from Safari with Keynote decks and from Chrome with Google Slides decks.",
            },
            {
              type: "info",
              message: `Set your background color to: ${currentTheme?.colors?.['editor.background']}`,
            },
          ]}
        />
      </div>
      <CustomThemeEditor className={styles.customThemeArea} />
    </>
  );
}

export default App;
