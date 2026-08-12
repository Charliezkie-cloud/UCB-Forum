import { Link, Outlet } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GraduationCap, Search, Bell, LogOut, Plus, User } from "lucide-react"

export function AppLayout() {
  const { user, logout } = useAuth()

  // Derive initial or display name
  const userDisplayName = user?.email ? user.email.split("@")[0] : "Guest User"
  const userInitial = userDisplayName.charAt(0).toUpperCase()

  return (
    <div className="flex min-h-svh flex-col bg-background font-sans antialiased text-foreground">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
                <GraduationCap className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-sm font-bold tracking-tight text-foreground leading-none sm:text-base">
                  University of Cebu
                </span>
                <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
                  Banilad Campus <span className="text-primary font-semibold normal-case">Forum</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md items-center">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search posts, categories, or members..."
                className="pl-9 pr-12 h-9 bg-muted/40 text-sm border-border/80 focus-visible:bg-background transition-colors"
              />
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Actions & User Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button size="sm" className="hidden sm:flex gap-1.5 font-medium shadow-sm">
              <Plus className="size-4" />
              <span>Create Post</span>
            </Button>

            <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
              <Bell className="size-4" />
              <span className="sr-only">Notifications</span>
            </Button>

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-border/80">
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 rounded-lg p-1 hover:bg-muted/60 transition-colors group"
                  title="View My Profile"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs border border-primary/20 group-hover:scale-105 transition-transform">
                    {userInitial}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-semibold text-foreground leading-tight truncate max-w-[120px]">
                      {userDisplayName}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {user.email}
                    </span>
                  </div>
                </Link>

                <Button
                  asChild
                  variant="ghost"
                  size="icon-sm"
                  title="My Profile"
                  className="text-muted-foreground hover:text-foreground transition-colors ml-1"
                >
                  <Link to="/profile">
                    <User className="size-4" />
                    <span className="sr-only">My Profile</span>
                  </Link>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  title="Log out"
                  onClick={logout}
                  className="text-muted-foreground hover:text-destructive transition-colors ml-0.5"
                >
                  <LogOut className="size-4" />
                  <span className="sr-only">Log out</span>
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 py-6">
        <Outlet />
      </main>

      {/* Modern Footer */}
      <footer className="border-t border-border bg-card/30 text-xs text-muted-foreground py-6 mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© {new Date().getFullYear()} University of Cebu, Banilad Campus. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:underline hover:text-foreground">Community Guidelines</a>
            <a href="#" className="hover:underline hover:text-foreground">Privacy Policy</a>
            <a href="#" className="hover:underline hover:text-foreground">Official Website</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

