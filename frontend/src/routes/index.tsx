import { createBrowserRouter } from "react-router-dom"
import { BannedRoute } from "@/components/auth/BannedRoute"
import { GuestRoute } from "@/components/auth/GuestRoute"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AppLayout } from "@/components/layouts/AppLayout"
import { AuthLayout } from "@/components/layouts/AuthLayout"
import { HomePage } from "@/pages/HomePage"
import { CategoriesPage } from "@/pages/CategoriesPage"
import { CategoryDetailPage } from "@/pages/CategoryDetailPage"
import { PostDetailPage } from "@/pages/PostDetailPage"
import { MyProfilePage } from "@/pages/MyProfilePage"
import { UserProfilePage } from "@/pages/UserProfilePage"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { SearchPage } from "@/pages/SearchPage"
import { TermsPage } from "@/pages/TermsPage"
import { PrivacyPage } from "@/pages/PrivacyPage"
import { LoginPage } from "@/pages/auth/LoginPage"
import { RegisterPage } from "@/pages/auth/RegisterPage"
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage"
import { BanPage } from "@/pages/auth/BanPage"

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/register", element: <RegisterPage /> },
          { path: "/forgot-password", element: <ForgotPasswordPage /> },
        ],
      },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      { path: "/terms", element: <TermsPage /> },
      { path: "/terms-of-use", element: <TermsPage /> },
      { path: "/privacy", element: <PrivacyPage /> },
      { path: "/privacy-policy", element: <PrivacyPage /> },
    ],
  },
  {
    element: <BannedRoute />,
    children: [{ path: "/banned", element: <BanPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <HomePage /> },
          { path: "/search", element: <SearchPage /> },
          { path: "/categories", element: <CategoriesPage /> },
          { path: "/categories/:slug", element: <CategoryDetailPage /> },
          { path: "/posts/:postId", element: <PostDetailPage /> },
          { path: "/profile", element: <MyProfilePage /> },
          { path: "/me", element: <MyProfilePage /> },
          { path: "/users/:userId", element: <UserProfilePage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
])
