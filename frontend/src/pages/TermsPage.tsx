import { Link } from "react-router-dom"
import {
  ShieldCheck,
  Users,
  AlertTriangle,
  GraduationCap,
  Scale,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export function TermsPage() {
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
              <Link to="/privacy">Privacy Policy</Link>
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent" className="gap-1 text-[11px]">
              <GraduationCap className="size-3.5" />
              <span>UC Banilad Community</span>
            </Badge>
            <span className="text-xs text-muted-foreground">Effective: August 2026</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Terms of Use & Guidelines
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Welcome to the University of Cebu Banilad Campus Forum. These terms outline how our community shares knowledge, respects one another, and keeps our academic space helpful and safe.
          </p>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/80 bg-card/60">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
              <Users className="size-4" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xs font-semibold text-foreground">Mutual Respect</h2>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Treat classmates, faculty, and guests with courtesy and constructive discussion.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
              <ShieldCheck className="size-4" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xs font-semibold text-foreground">Academic Honesty</h2>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Share study resources responsibly. Do not trade exam answers or leaked tests.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
              <Scale className="size-4" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xs font-semibold text-foreground">Role Permissions</h2>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Special categories require verified Student or Teacher status to protect sensitive topics.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-6 text-sm text-foreground/90 leading-relaxed">
        {/* Section 1 */}
        <Card className="border-border/80">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold font-mono">
                1
              </div>
              <CardTitle className="text-base font-semibold">Acceptance of Terms</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3 text-muted-foreground text-xs sm:text-sm">
            <p>
              By creating an account, browsing discussions, or posting content on the UCB Forum, you agree to follow these Terms of Use and all applicable university policies. If you do not agree with any part of these terms, please refrain from using the platform.
            </p>
            <p>
              We may update these terms occasionally to reflect new campus programs, features, or community safety standards. We will announce significant updates on the forum homepage.
            </p>
          </CardContent>
        </Card>

        {/* Section 2 */}
        <Card className="border-border/80">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold font-mono">
                2
              </div>
              <CardTitle className="text-base font-semibold">User Accounts & Verification</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3 text-muted-foreground text-xs sm:text-sm">
            <p>
              We provide tailored access levels to support different community members:
            </p>
            <ul className="space-y-2 pl-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">Guests:</strong> Prospective students and visitors can participate in open general discussion categories.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">UCB Students:</strong> Enrolled students can verify their academic program and year level to access course-specific boards and student councils.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">Teachers & Faculty:</strong> Faculty members can verify their academic department to post official course guidance and mentorship topics.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">Moderators & Administrators:</strong> Appointed staff responsible for maintaining forum security, organizing categories, and resolving reports.
                </span>
              </li>
            </ul>
            <p className="pt-1">
              You are responsible for keeping your login credentials confidential. Never share your password or let others post under your account identity.
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
              <CardTitle className="text-base font-semibold">Community Standards & Code of Conduct</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3 text-muted-foreground text-xs sm:text-sm">
            <p>
              To maintain a supportive campus environment, all members must follow these standards:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg border border-border/70 bg-card/40 space-y-1">
                <p className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  Encouraged Behavior
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 pl-4 list-disc">
                  <li>Constructive questions about subjects and campus life</li>
                  <li>Sharing study tips, project notes, and book suggestions</li>
                  <li>Celebrating fellow students and student organization events</li>
                  <li>Giving helpful answers and positive reputation points</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/5 space-y-1">
                <p className="font-semibold text-destructive text-xs flex items-center gap-1.5">
                  <AlertTriangle className="size-3.5 text-destructive" />
                  Prohibited Behavior
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 pl-4 list-disc">
                  <li>Harassment, bullying, defamation, or hate speech</li>
                  <li>Posting confidential exam questions, answer keys, or unauthorized test leaks</li>
                  <li>Doxxing or posting private personal information of others</li>
                  <li>Spamming, advertising commercial services, or bot traffic</li>
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
              <CardTitle className="text-base font-semibold">Content Ownership & Posting Privileges</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3 text-muted-foreground text-xs sm:text-sm">
            <p>
              You retain ownership of the original text and materials you post on the forum. By posting, you grant the forum a non-exclusive license to display, index, and organize your contributions for the campus community.
            </p>
            <p>
              Please ensure you have the right to share any materials you upload. Do not post copyrighted textbooks, third-party proprietary software, or materials that violate intellectual property rights.
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
              <CardTitle className="text-base font-semibold">Moderation & Enforcement</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3 text-muted-foreground text-xs sm:text-sm">
            <p>
              Moderators and administrators work to keep discussions friendly and relevant. If a post violates our guidelines, moderators may:
            </p>
            <ul className="space-y-1.5 pl-2">
              <li className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-primary shrink-0 mt-2" />
                <span>Move posts to their appropriate department or subject category</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-primary shrink-0 mt-2" />
                <span>Edit or remove offensive remarks, spam, and personal data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-primary shrink-0 mt-2" />
                <span>Temporarily suspend or permanently disable accounts for severe or repeated violations</span>
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
              <CardTitle className="text-base font-semibold">Disclaimer & Limitation of Liability</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3 text-muted-foreground text-xs sm:text-sm">
            <p>
              Discussions and opinions expressed by individual users belong solely to their respective authors and do not necessarily represent official university statements unless posted by verified department faculty.
            </p>
            <p>
              We strive to keep the platform available and reliable, but we cannot guarantee uninterrupted uptime. Always verify critical enrollment deadlines and grade submissions through official University of Cebu registrar and portal channels.
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
              <CardTitle className="text-base font-semibold">Questions & Feedback</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3 text-muted-foreground text-xs sm:text-sm">
            <p>
              If you have questions about these terms or wish to report a community concern, please reach out to our moderation team through the forum or talk to your campus student representative.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer Navigation */}
      <Separator />
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} University of Cebu, Banilad Campus Forum.</p>
        <div className="flex items-center gap-4">
          <Link to="/privacy" className="text-primary hover:underline font-medium">
            Read Privacy Policy
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
