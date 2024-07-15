/* eslint-disable react/prop-types */
import React from "react";
import { useProvider } from "./useProvider";

export const ContextStore = React.createContext();

export function ContextProvider({ children }) {
  const { store, dispatch } = useProvider();
  return (
    <ContextStore.Provider value={{ store, dispatch }}>
      {children}
    </ContextStore.Provider>
  );
}
