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
