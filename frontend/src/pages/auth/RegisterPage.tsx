import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"
import { User, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, UserPlus } from "lucide-react"

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await register({ username, email, password })
      navigate("/", { replace: true })
    } catch {
      setError("Unable to register. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="shadow-lg border-border/80 rounded-2xl overflow-hidden">
      <CardHeader className="space-y-1.5 p-6 pb-4 bg-muted/20 border-b border-border/60">
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading text-xl font-bold">Create account</CardTitle>
          <UserPlus className="size-5 text-primary" />
        </div>
        <CardDescription className="text-xs">
          Join the University of Cebu Banilad discussion forum.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-xs font-semibold">
              Username
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="username"
                placeholder="johndoe"
                autoComplete="username"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="pl-9 h-10 text-sm bg-background border-border/80 focus-visible:ring-2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="student@ucb.edu.ph"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="pl-9 h-10 text-sm bg-background border-border/80 focus-visible:ring-2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-semibold">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="pl-9 pr-9 h-10 text-sm bg-background border-border/80 focus-visible:ring-2"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {error ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 p-6 pt-0">
          <Button
            type="submit"
            className="w-full h-10 font-semibold shadow-sm text-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground pt-1">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary underline underline-offset-4 hover:text-primary/80">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
