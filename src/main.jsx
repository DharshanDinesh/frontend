import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.jsx";
import { ContextProvider } from "./Provider.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Enable refetch on window focus
    },
  },
});
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Suspense fallback={<h1>loading</h1>}>
      <QueryClientProvider client={queryClient}>
        <ContextProvider>
          <App />
        </ContextProvider>
      </QueryClientProvider>
    </Suspense>
  </React.StrictMode>
);
