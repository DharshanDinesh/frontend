/* eslint-disable no-unused-vars */
import { Container } from "./Components/Container/Container";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Container />,
    children: [
      {
        path: "/",
        lazy: async () => {
          let { Home } = await import("./Pages/Home/Home");
          return { Component: Home };
        },
      },
      {
        path: "/income",
        lazy: async () => {
          let { Bill } = await import("./Pages/Bill/Bill");
          return { Component: Bill };
        },
      },

      {
        path: "/expense",
        lazy: async () => {
          let { Expense } = await import("./Pages/Expense/Expense");
          return { Component: Expense };
        },
      },
      {
        path: "/dashboard",
        lazy: async () => {
          let { Dashboard } = await import("./Pages/Dashboard/Dashboard");
          return { Component: Dashboard };
        },
      },
      {
        path: "*",
        lazy: async () => {
          let { RedirectToHome } = await import(
            "./Components/RedirectComponent/RedirectToHome"
          );
          return { Component: RedirectToHome };
        },
      },
    ],
  },
]);
export function App() {
  return (
    <>
      <ToastContainer />
      <RouterProvider router={router} />
    </>
  );
}
