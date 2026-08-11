import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Compass, ArrowLeft, Home } from "lucide-react"

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-12 antialiased text-foreground">
      <Card className="w-full max-w-md text-center shadow-lg border-border/80 rounded-2xl overflow-hidden">
        <CardContent className="p-8 space-y-6">
          {/* Icon Badge */}
          <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
            <Compass className="size-10 stroke-[1.75]" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-mono text-xs font-bold uppercase tracking-wider">
              Error 404
            </span>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              Page Not Found
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
              The campus page or post you are looking for might have been moved, deleted, or doesn't exist.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto h-9 gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="size-4" />
              <span>Go Back</span>
            </Button>
            <Button asChild size="sm" className="w-full sm:w-auto h-9 gap-1.5 text-xs font-semibold shadow-xs">
              <Link to="/">
                <Home className="size-4" />
                <span>Return to Home Feed</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
