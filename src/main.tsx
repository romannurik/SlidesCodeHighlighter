import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ConfigWrapper } from "./Config.tsx";
import "./index.scss";
import { AppStateWrapper } from "./AppState.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigWrapper>
      <AppStateWrapper>
        <App />
      </AppStateWrapper>
    </ConfigWrapper>
  </React.StrictMode>
);
