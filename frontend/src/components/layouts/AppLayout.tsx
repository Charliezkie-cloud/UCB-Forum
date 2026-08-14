import { Outlet } from "react-router-dom"
import { Navbar } from "@/components/layouts/Navbar"
import { Footer } from "@/components/layouts/Footer"

export function AppLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-background font-sans antialiased text-foreground">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}


