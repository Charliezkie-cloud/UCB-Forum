import { Link } from "react-router-dom"
import { ChevronRight, FolderTree } from "lucide-react"
import { CategoriesTreePanel } from "@/components/categories/CategoriesTreePanel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CategoriesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="size-3.5 shrink-0" />
        <span className="font-medium text-foreground">Categories</span>
      </nav>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="relative h-28 w-full bg-gradient-to-r from-primary/20 via-primary/10 to-accent/30 sm:h-36">
          <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
        </div>

        <div className="relative px-6 pb-6 pt-0 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between -mt-10 sm:-mt-12">
            <div className="flex items-end gap-4">
              <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md ring-4 ring-card sm:size-24">
                <FolderTree className="size-9 sm:size-10" />
              </div>
              <div className="space-y-1 pb-1">
                <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Categories
                </h1>
                <p className="text-sm text-muted-foreground max-w-xl">
                  Browse every discussion space on campus. Select a category to view
                  its conversations and subcategories.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border bg-muted/30 px-6 py-3.5 sm:px-8">
          <p className="text-xs text-muted-foreground">
            Pick a category for your topic. You'll find spaces for departments, courses, campus news, and student life.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden border-border/80 shadow-xs">
        <CardHeader className="border-b border-border/60 bg-muted/20 pb-3">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            All categories
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <CategoriesTreePanel />
        </CardContent>
      </Card>
    </div>
  )
}
