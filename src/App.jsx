/* eslint-disable no-unused-vars */
import { Container } from "./Components/Container/Container";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useContext, useMemo } from "react";
import { ContextStore } from "./Provider";
import { LoginForm } from "./Pages/Login/Login";

export function App() {
  const { store } = useContext(ContextStore);
  const isAuthenticated = store?.ui?.isLoggedIn;

  const router = useMemo(() => {
    return createBrowserRouter([
      {
        path: "/login",
        element: isAuthenticated ? <Navigate to="/home" /> : <LoginForm />
      },
      {
        path: "/",
        element: isAuthenticated ? <Container /> : <Navigate to="/login" />,
        children: [
          {
            path: "",
            element: <Navigate to="/home" />
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
           {
            path: "/dashboardv2",
            lazy: async () => {
              if (!isAuthenticated) {
                return { Component: () => <Navigate to="/login" /> };
              }
              let { DashboardV2 } = await import("./Pages/DashboardV2/DashboardV2");
              return { Component: DashboardV2 };
            },
          },
          {
            path: "/customer",
            lazy: async () => {
              if (!isAuthenticated) {
                return { Component: () => <Navigate to="/login" /> };
              }
              let { CustomerForm } = await import(
                "./Pages/CustomerDetails/CustomerDetails"
              );
              return { Component: CustomerForm };
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
  }, [isAuthenticated]);
  return (
    <>
      <ToastContainer />
      <RouterProvider router={router} />
    </>
  );
}
