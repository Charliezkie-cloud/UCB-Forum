import { Link } from "react-router-dom"
import {
  Lock,
  Eye,
  Database,
  UserCheck,
  Trash2,
  ArrowLeft,
  GraduationCap,
  Bell,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export function PrivacyPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      {/* Back button and page header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Link to="/">
              <ArrowLeft className="size-4" />
              <span>Back to Forum</span>
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild className="text-xs h-8">
              <Link to="/terms">Terms of Use</Link>
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent" className="gap-1 text-[11px]">
              <GraduationCap className="size-3.5" />
              <span>UC Banilad Privacy</span>
            </Badge>
            <span className="text-xs text-muted-foreground">Effective: August 2026</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Your privacy is important to us. This policy explains what information we collect, how we protect your personal details, and how you stay in control of your data on the UCB Forum.
          </p>
        </div>
      </div>

      {/* Quick Summary Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/80 bg-card/60">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
              <Lock className="size-4" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xs font-semibold text-foreground">Secure Credentials</h2>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Passwords are cryptographically hashed and never stored in plain text.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
              <Eye className="size-4" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xs font-semibold text-foreground">Public vs Private</h2>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                You decide what profile info to share, like social links and bio descriptions.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
              <Trash2 className="size-4" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xs font-semibold text-foreground">Account Control</h2>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                You can update your profile anytime or delete your account whenever you want.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Policy Sections */}
      <div className="space-y-6 text-sm text-foreground/90 leading-relaxed">
        {/* Section 1 */}
        <Card className="border-border/80">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold font-mono">
                1
              </div>
              <CardTitle className="text-base font-semibold">Information We Collect</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3 text-muted-foreground text-xs sm:text-sm">
            <p>
              We only collect information necessary to run our campus forum and verify community participation:
            </p>
            <div className="space-y-2.5 pl-2">
              <div className="flex items-start gap-2">
                <Database className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Account Information:</strong> When you register, we collect your chosen username, email address, and a secure hash of your password.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <UserCheck className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Profile & Verification Details:</strong> You may optionally add a bio, avatar image, and social media handles. If you verify your student or faculty status, we record your academic program, year level, or department.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Bell className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Activity Data:</strong> We store posts, replies, upvotes/likes, and reputation ratings that you create while interacting on the boards.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2 */}
        <Card className="border-border/80">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold font-mono">
                2
              </div>
              <CardTitle className="text-base font-semibold">How We Use Your Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3 text-muted-foreground text-xs sm:text-sm">
            <p>We use the collected information for the following practical purposes:</p>
            <ul className="space-y-1.5 pl-4 list-disc">
              <li>Authenticating your account and keeping your session secure.</li>
              <li>Displaying verified student and teacher badges on posts and profiles.</li>
              <li>Delivering notifications when someone replies to your threads or gives you reputation points.</li>
              <li>Organizing discussion boards and sorting posts by popularity and recent activity.</li>
              <li>Preventing spam, abuse, and unapproved commercial automated bots.</li>
            </ul>
            <p className="pt-1">
              We never sell or rent your personal information to third-party advertisers or commercial brokers.
            </p>
          </CardContent>
        </Card>

        {/* Section 3 */}
        <Card className="border-border/80">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold font-mono">
                3
              </div>
              <CardTitle className="text-base font-semibold">Public vs. Private Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3 text-muted-foreground text-xs sm:text-sm">
            <p>
              Here is a clear breakdown of what other community members can see:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg border border-border/70 bg-card/40 space-y-1">
                <p className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                  <Eye className="size-3.5 text-primary" />
                  Visible to Members
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 pl-4 list-disc">
                  <li>Your public username and avatar</li>
                  <li>Your bio and linked social handles</li>
                  <li>Verified badges (e.g. BSIT 3rd Year or CCS Faculty)</li>
                  <li>Your public posts, comments, and reputation score</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg border border-border/70 bg-card/40 space-y-1">
                <p className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                  <Lock className="size-3.5 text-emerald-500" />
                  Kept Private & Encrypted
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 pl-4 list-disc">
                  <li>Your password (hashed with secure salts)</li>
                  <li>Your private account email address</li>
                  <li>Unread notifications and session tokens</li>
                  <li>Moderation logs and administrative audit trails</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4 */}
        <Card className="border-border/80">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold font-mono">
                4
              </div>
              <CardTitle className="text-base font-semibold">Data Storage & Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3 text-muted-foreground text-xs sm:text-sm">
            <p>
              Our backend uses Microsoft SQL Server and ASP.NET Core security best practices. Passwords are never stored as plain text. Communication between your browser and our server is protected with modern SSL/TLS encryption.
            </p>
            <p>
              While we implement strong safeguards to protect our community database, please remember to use a unique password and avoid logging into public shared computers without signing out.
            </p>
          </CardContent>
        </Card>

        {/* Section 5 */}
        <Card className="border-border/80">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold font-mono">
                5
              </div>
              <CardTitle className="text-base font-semibold">Your Data Rights & Choices</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3 text-muted-foreground text-xs sm:text-sm">
            <p>
              You maintain full control over your forum identity. Through your profile settings, you can:
            </p>
            <ul className="space-y-1.5 pl-2">
              <li className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-primary shrink-0 mt-2" />
                <span>Update or remove your bio, avatar, and social media links anytime.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-primary shrink-0 mt-2" />
                <span>Change your account password securely.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-primary shrink-0 mt-2" />
                <span>Delete or edit individual posts and replies you authored.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-primary shrink-0 mt-2" />
                <span>Permanently delete your account and associated profile data via the profile settings danger zone.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 6 */}
        <Card className="border-border/80">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold font-mono">
                6
              </div>
              <CardTitle className="text-base font-semibold">Philippine Data Privacy Act (RA 10173)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3 text-muted-foreground text-xs sm:text-sm">
            <p>
              We operate in accordance with Republic Act No. 10173, also known as the Data Privacy Act of 2012 of the Philippines. We process student and faculty information under the principles of transparency, legitimate purpose, and proportionality.
            </p>
          </CardContent>
        </Card>

        {/* Section 7 */}
        <Card className="border-border/80">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold font-mono">
                7
              </div>
              <CardTitle className="text-base font-semibold">Contact & Privacy Inquiries</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3 text-muted-foreground text-xs sm:text-sm">
            <p>
              If you have any questions or data requests regarding this Privacy Policy, please get in touch with our team through the forum or contact the campus administration.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer Navigation */}
      <Separator />
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} University of Cebu, Banilad Campus Forum.</p>
        <div className="flex items-center gap-4">
          <Link to="/terms" className="text-primary hover:underline font-medium">
            Read Terms of Use
          </Link>
          <span>•</span>
          <Link to="/" className="hover:underline">
            Home Feed
          </Link>
        </div>
      </div>
    </div>
  )
}
