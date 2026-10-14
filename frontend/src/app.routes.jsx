import { createBrowserRouter, Navigate } from "react-router";
import Register from "./features/auth/pages/Register";
import Login from "./features/auth/pages/Login";
import Protected from "./features/auth/components/Protected";
import Dashboard from "./features/applications/pages/Dashboard";
import Statistics from "./features/applications/pages/Statistics";
import HomePage from "./features/applications/pages/HomePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/dashboard",
    element: (
      <Protected>
        <Dashboard />
      </Protected>
    ),
  },
  {
    path: "/board",
    element: (
      <Protected>
        <Dashboard />
      </Protected>
    ),
  },
  {
    path: "/statistics",
    element: (
      <Protected>
        <Statistics />
      </Protected>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
