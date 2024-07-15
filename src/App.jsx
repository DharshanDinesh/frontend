/* eslint-disable no-unused-vars */
import { Container } from "./Components/Container/Container";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import { Bill } from "./Pages/Bill/Bill";
import { Dashboard } from "./Pages/Dashboard/Dashboard";
import DailyIncomeExpenseCalculator from "./Pages/Dashboard/dd";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Container />,
    children: [
      {
        path: "/",
        element: <DailyIncomeExpenseCalculator />,
      },
      {
        path: "/bill",
        element: <Bill />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
    ],
  },
]);
export function App() {
  return <RouterProvider router={router} />;
}
