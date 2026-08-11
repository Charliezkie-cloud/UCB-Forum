import { createBrowserRouter } from "react-router-dom"
import { GuestRoute } from "@/components/auth/GuestRoute"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AppLayout } from "@/components/layouts/AppLayout"
import { AuthLayout } from "@/components/layouts/AuthLayout"
import { HomePage } from "@/pages/HomePage"
import { MyProfilePage } from "@/pages/MyProfilePage"
import { UserProfilePage } from "@/pages/UserProfilePage"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { LoginPage } from "@/pages/auth/LoginPage"
import { RegisterPage } from "@/pages/auth/RegisterPage"

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/register", element: <RegisterPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <HomePage /> },
          { path: "/profile", element: <MyProfilePage /> },
          { path: "/me", element: <MyProfilePage /> },
          { path: "/users/:userId", element: <UserProfilePage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
])
