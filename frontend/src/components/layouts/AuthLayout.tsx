import { Link, Outlet } from "react-router-dom"
import { GraduationCap } from "lucide-react"

export function AuthLayout() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-8 antialiased text-foreground">
      <div className="mb-6 flex flex-col items-center text-center">
        <Link to="/login" className="flex items-center gap-2.5 group">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-105">
            <GraduationCap className="size-6" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-heading text-xl font-bold tracking-tight text-foreground leading-none sm:text-2xl">
              University of Cebu
            </span>
            <span className="text-xs text-muted-foreground font-medium tracking-wider uppercase mt-0.5">
              Banilad Campus <span className="text-primary font-semibold normal-case">Forum</span>
            </span>
          </div>
        </Link>
        <p className="mt-3 text-xs text-muted-foreground max-w-xs leading-relaxed">
          Talk about classes, campus news, and ask questions with fellow students and faculty.
        </p>
      </div>

      <div className="w-full max-w-md">
        <Outlet />
      </div>

      <div className="mt-8 text-center text-[11px] text-muted-foreground">
        <p>© {new Date().getFullYear()} University of Cebu, Banilad Campus. All rights reserved.</p>
      </div>
    </div>
  )
}

