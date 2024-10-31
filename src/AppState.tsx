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

import { createContext, PropsWithChildren, useMemo, useState } from "react";

export interface Selection {
  start: number;
  end: number;
}

export interface AppState {
  selections: Selection[];
}

export interface AppStateContextType extends AppState {
  update(updates: Partial<AppState>): void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AppStateContext = createContext<AppStateContextType>(
  null as unknown as AppStateContextType
);

export function AppStateWrapper({ children }: PropsWithChildren) {
  const [appState, setAppState] = useState<AppState>({
    selections: [],
  });

  const configContext = useMemo<AppStateContextType>(() => {
    return {
      ...appState,
      update(updates) {
        setAppState({
          ...appState,
          ...updates,
        });
      },
    };
  }, [appState]);

  return (
    <AppStateContext.Provider value={configContext}>
      {children}
    </AppStateContext.Provider>
  );
}
