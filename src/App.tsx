import cn from "classnames";
import { useMemo } from "react";
import styles from "./App.module.scss";
import { Editor } from "./components/Editor";
import { Output } from "./components/Output";
import { InputToolbar } from "./components/toolbars/InputToolbar";
import { OutputToolbar } from "./components/toolbars/OutputToolbar";
import { WarningMessages } from "./components/WarningMessages";
import { useConfig } from "./Config";
import { resolveTheme } from "./themes";
import { MessageList } from "./components/MessageList";

function App() {
  let [config] = useConfig();
  let currentTheme = useMemo(() => resolveTheme(config), [config]);

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
              message: `Set your background color to: ${currentTheme.bgColor}`,
            },
          ]}
        />
      </div>
      {/* <CustomThemeEditor /> */}
    </>
  );
}

export default App;
