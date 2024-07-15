/* eslint-disable no-unused-vars */
import { Container } from "./Components/Container/Container";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import { lazy, Suspense } from "react";

// import { Bill } from "./Pages/Bill/Bill";
// import { Dashboard } from "./Pages/Dashboard/Dashboard";

// const Bill = lazy(() => import("./Pages/Bill/Bill"));
// const Dashboard = lazy(() => import("./Pages/Dashboard/Dashboard"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <Container />,
    children: [
      {
        path: "/",
        element: <>dsfa</>,
      },
      {
        path: "/bill",
        lazy: async () => {
          let { Bill } = await import("./Pages/Bill/Bill");
          return { Component: Bill };
        },
      },
      {
        path: "/dashboard",
        lazy: async () => {
          let { Dashboard } = await import("./Pages/Dashboard/Dashboard");
          return { Component: Dashboard };
        },
      },
    ],
  },
]);
export function App() {
  return <RouterProvider router={router} />;
}
