import { Link } from "react-router-dom"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/30 text-xs text-muted-foreground py-6 mt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
        <p>© {new Date().getFullYear()} University of Cebu, Banilad Campus. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link to="/terms" className="hover:underline hover:text-foreground transition-colors">
            Terms of Use
          </Link>
          <Link to="/privacy" className="hover:underline hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <a
            href="https://uc.edu.ph"
            target="_blank"
            rel="noreferrer"
            className="hover:underline hover:text-foreground transition-colors"
          >
            Official Website
          </a>
        </div>
      </div>
    </footer>
  )
}

