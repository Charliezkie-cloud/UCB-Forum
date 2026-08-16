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
import { forgotPassword, resetPassword } from "@/api/auth"
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  Copy,
  Check,
} from "lucide-react"

type Step = "request" | "reset" | "success"

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>("request")

  // Form states
  const [email, setEmail] = useState("")
  const [resetToken, setResetToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasCopiedToken, setHasCopiedToken] = useState(false)

  async function handleRequestToken(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setInfoMessage(null)
    setIsSubmitting(true)

    try {
      const response = await forgotPassword({ email: email.trim() })
      setResetToken(response.resetToken)
      setInfoMessage(response.message || "Reset token generated. Please enter your new password below.")
      setStep("reset")
    } catch (err: unknown) {
      const maybeAxios = err as { response?: { data?: { message?: string } } }
      const message =
        maybeAxios.response?.data?.message ||
        "We could not find an account with that email. Please check and try again."
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    if (newPassword !== confirmNewPassword) {
      setError("New password and confirmation do not match.")
      return
    }

    setIsSubmitting(true)

    try {
      await resetPassword({
        resetToken: resetToken.trim(),
        newPassword,
        confirmNewPassword,
      })
      setStep("success")
    } catch (err: unknown) {
      const maybeAxios = err as { response?: { data?: { message?: string } } }
      const message =
        maybeAxios.response?.data?.message ||
        "Failed to reset your password. Your reset token may have expired. Please request a new one."
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleCopyToken() {
    if (!resetToken) return
    navigator.clipboard.writeText(resetToken)
    setHasCopiedToken(true)
    setTimeout(() => setHasCopiedToken(false), 2000)
  }

  return (
    <Card className="shadow-lg border-border/80 rounded-2xl overflow-hidden">
      <CardHeader className="space-y-1.5 p-6 pb-4 bg-muted/20 border-b border-border/60">
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading text-xl font-bold">Reset Password</CardTitle>
          <KeyRound className="size-5 text-primary" />
        </div>
        <CardDescription className="text-xs">
          {step === "request" && "Enter your email address to generate a secure password reset token."}
          {step === "reset" && "Create a new secure password for your account."}
          {step === "success" && "Your password has been changed successfully."}
        </CardDescription>
      </CardHeader>

      {step === "request" && (
        <form onSubmit={handleRequestToken}>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="student@uc.edu.ph"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="pl-9 h-10 text-sm bg-background border-border/80 focus-visible:ring-2"
                />
              </div>
            </div>

            {error ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  setError(null)
                  setStep("reset")
                }}
                className="text-xs text-primary hover:underline font-medium"
              >
                Already have a reset token?
              </button>
            </div>
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
                  Generating token…
                </>
              ) : (
                "Continue"
              )}
            </Button>

            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground pt-1"
            >
              <ArrowLeft className="size-3.5" />
              Back to sign in
            </Link>
          </CardFooter>
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={handleResetPassword}>
          <CardContent className="space-y-4 p-6">
            {infoMessage ? (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-foreground">
                <p className="font-medium">{infoMessage}</p>
              </div>
            ) : null}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="token" className="text-xs font-semibold">
                  Reset Token
                </Label>
                {resetToken ? (
                  <button
                    type="button"
                    onClick={handleCopyToken}
                    className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    {hasCopiedToken ? (
                      <>
                        <Check className="size-3 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        <span>Copy token</span>
                      </>
                    )}
                  </button>
                ) : null}
              </div>
              <Input
                id="token"
                type="text"
                placeholder="Paste your reset token here"
                required
                value={resetToken}
                onChange={(event) => setResetToken(event.target.value)}
                className="h-10 text-xs font-mono bg-background border-border/80 focus-visible:ring-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-xs font-semibold">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
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

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword" className="text-xs font-semibold">
                Confirm New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="confirmNewPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  value={confirmNewPassword}
                  onChange={(event) => setConfirmNewPassword(event.target.value)}
                  className="pl-9 pr-9 h-10 text-sm bg-background border-border/80 focus-visible:ring-2"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
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
                  Resetting password…
                </>
              ) : (
                "Set New Password"
              )}
            </Button>

            <button
              type="button"
              onClick={() => {
                setError(null)
                setStep("request")
              }}
              className="inline-flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground pt-1"
            >
              <ArrowLeft className="size-3.5" />
              Request a different token
            </button>
          </CardFooter>
        </form>
      )}

      {step === "success" && (
        <CardContent className="space-y-5 p-6 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle2 className="size-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-semibold">Password updated</h3>
            <p className="text-xs text-muted-foreground">
              You can now sign in using your new password.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => navigate("/login", { replace: true })}
            className="w-full h-10 font-semibold text-sm"
          >
            Go to Sign in
          </Button>
        </CardContent>
      )}
    </Card>
  )
}
