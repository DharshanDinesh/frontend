/* eslint-disable no-unused-vars */
import { Container } from "./Components/Container/Container";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useContext } from "react";
import { ContextStore } from "./Provider";

export function App() {
  const router = ({ isAuthenticated = false }) => {
    return createBrowserRouter([
      {
        path: "/",
        element: <Container />,
        children: [
          {
            path: "/",
            lazy: async () => {
              if (!isAuthenticated) {
                return { Component: () => <Navigate to="/login" /> };
              } else {
                return {
                  Component: () => <Navigate to="/home" />,
                };
              }
            },
          },
          {
            path: "/home",
            lazy: async () => {
              console.log("isAuthenticated", isAuthenticated);
              if (!isAuthenticated) {
                return { Component: () => <Navigate to="/login" /> };
              }
              let { Home } = await import("./Pages/Home/Home");
              return { Component: Home };
            },
          },
          {
            path: "/income",
            lazy: async () => {
              if (!isAuthenticated) {
                return { Component: () => <Navigate to="/login" /> };
              }
              let { Bill } = await import("./Pages/Bill/Bill");
              return { Component: Bill };
            },
          },
          {
            path: "/expense",
            lazy: async () => {
              if (!isAuthenticated) {
                return { Component: () => <Navigate to="/login" /> };
              }
              let { Expense } = await import("./Pages/Expense/Expense");
              return { Component: Expense };
            },
          },
          {
            path: "/dashboard",
            lazy: async () => {
              if (!isAuthenticated) {
                return { Component: () => <Navigate to="/login" /> };
              }
              let { Dashboard } = await import("./Pages/Dashboard/Dashboard");
              return { Component: Dashboard };
            },
          },
        ],
      },
      {
        path: "/login",
        lazy: async () => {
          let { LoginForm } = await import("./Pages/Login/Login");
          return { Component: LoginForm };
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
    ]);
  };
  const { store } = useContext(ContextStore);
  return (
    <>
      <ToastContainer />
      <RouterProvider
        router={router({ isAuthenticated: store?.ui?.isLoggedIn })}
      />
    </>
  );
}
