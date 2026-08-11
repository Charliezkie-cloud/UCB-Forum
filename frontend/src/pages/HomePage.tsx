import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/useAuth"
import {
  Flame,
  Sparkles,
  TrendingUp,
  MessageCircle,
  Share2,
  Bookmark,
  Pin,
  CheckCircle2,
  Megaphone,
  Building2,
  BookOpen,
  Users,
  Code2,
  Image as ImageIcon,
  Link2,
  Award,
  Shield,
  ArrowBigUp,
  ArrowBigDown,
  Clock,
  ChevronRight,
} from "lucide-react"

interface FeedPost {
  id: number
  title: string
  content: string
  category: string
  author: string
  role: "Student" | "Teacher" | "Moderator" | "Admin"
  programOrDept?: string
  isVerified: boolean
  isPinned?: boolean
  likes: number
  commentsCount: number
  createdAt: string
  tags: string[]
  codeSnippet?: string
}

const INITIAL_POSTS: FeedPost[] = [
  {
    id: 1,
    title: "Official Announcement: Midterm Examination Schedule for 2nd Semester",
    content: "The official midterm exam schedule for academic year 2025-2026 has been published by the Academic Affairs department. Please check your student portal to verify classroom assignments and timing.",
    category: "Campus News",
    author: "Prof. Santos",
    role: "Teacher",
    programOrDept: "Department of Academic Affairs",
    isVerified: true,
    isPinned: true,
    likes: 142,
    commentsCount: 38,
    createdAt: "2 hours ago",
    tags: ["#Midterms2026", "#AcademicNotice", "#UCBBanilad"],
  },
  {
    id: 2,
    title: "How do you optimize SQL Server indexing for multi-column queries in EF Core?",
    content: "We are currently working on our Capstone project using ASP.NET Core and MS SQL Server. We noticed slow query execution when filtering by CategoryId and CreatedAt together. Should we use composite non-clustered indexes?",
    category: "CCS • Computer Studies",
    author: "Alex Rivera",
    role: "Student",
    programOrDept: "BS Information Technology • 4th Year",
    isVerified: true,
    likes: 89,
    commentsCount: 24,
    createdAt: "4 hours ago",
    tags: ["#SQLServer", "#EFCore", "#CapStone", "#CCS"],
    codeSnippet: `builder.Entity<Post>()\n  .HasIndex(p => new { p.CategoryId, p.CreatedAt })\n  .HasDatabaseName("IX_Posts_Category_CreatedAt");`,
  },
  {
    id: 3,
    title: "UCB Hackathon 2026: Call for Student Teams & Mentors!",
    content: "Registration for the annual UCB Innovation Hackathon is now open. Build web applications, AI tools, or IoT prototypes over a 48-hour challenge with prizes total up to ₱50,000!",
    category: "Events & Competition",
    author: "CCS Student Council",
    role: "Moderator",
    programOrDept: "College of Computer Studies",
    isVerified: true,
    likes: 115,
    commentsCount: 19,
    createdAt: "6 hours ago",
    tags: ["#UCBHackathon", "#Developers", "#TechCommunity"],
  },
  {
    id: 4,
    title: "Study Group for Engineering Mathematics 3 (Differential Equations)",
    content: "Looking for fellow COE students who want to review together for the upcoming exam. We meet at the 4th floor library study hub every Tuesday and Thursday at 4 PM.",
    category: "COE • Engineering",
    author: "Maria Clara",
    role: "Student",
    programOrDept: "BS Civil Engineering • 2nd Year",
    isVerified: true,
    likes: 45,
    commentsCount: 12,
    createdAt: "8 hours ago",
    tags: ["#COE", "#StudyGroup", "#EngMath"],
  },
]

export function HomePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"hot" | "new" | "top" | "questions">("hot")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [posts, setPosts] = useState<FeedPost[]>(INITIAL_POSTS)
  const [userVotes, setUserVotes] = useState<Record<number, "up" | "down" | null>>({})
  const [userSaved, setUserSaved] = useState<Record<number, boolean>>({})

  // Handle Voting
  const handleVote = (postId: number, direction: "up" | "down") => {
    const currentVote = userVotes[postId]
    let voteDiff = 0
    let newVote: "up" | "down" | null = direction

    if (currentVote === direction) {
      // Undo vote
      newVote = null
      voteDiff = direction === "up" ? -1 : 1
    } else if (currentVote === null || currentVote === undefined) {
      // New vote
      voteDiff = direction === "up" ? 1 : -1
    } else {
      // Switch vote
      voteDiff = direction === "up" ? 2 : -2
    }

    setUserVotes((prev) => ({ ...prev, [postId]: newVote }))
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + voteDiff } : p))
    )
  }

  // Handle Save Bookmark
  const handleSave = (postId: number) => {
    setUserSaved((prev) => ({ ...prev, [postId]: !prev[postId] }))
  }

  const userDisplayName = user?.email ? user.email.split("@")[0] : "Student"

  const filteredPosts = posts.filter((post) => {
    if (selectedCategory === "All") return true
    return post.category.toLowerCase().includes(selectedCategory.toLowerCase())
  })

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* LEFT SIDEBAR: Navigation & Communities */}
      <aside className="hidden lg:col-span-3 lg:block space-y-4">
        {/* User Card */}
        <Card className="shadow-xs border-border/80">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-base border border-primary/20">
                {userDisplayName.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-0.5 overflow-hidden">
                <h3 className="font-semibold text-sm truncate text-foreground">
                  {userDisplayName}
                </h3>
                <div className="flex items-center gap-1.5">
                  <Badge variant="accent" className="text-[10px] py-0">
                    UCB Student
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    ★ 240 rep
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-border/60 flex justify-between text-xs text-muted-foreground">
              <span>My Posts: <strong className="text-foreground font-semibold">12</strong></span>
              <span>Bookmarks: <strong className="text-foreground font-semibold">5</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Feeds */}
        <Card className="shadow-xs border-border/80">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Feeds
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-0.5">
            <Button
              variant={selectedCategory === "All" ? "secondary" : "ghost"}
              className="w-full justify-start h-9 gap-2.5 font-medium text-xs"
              onClick={() => setSelectedCategory("All")}
            >
              <Flame className="size-4 text-primary" />
              <span>Campus Home Feed</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start h-9 gap-2.5 font-medium text-xs text-muted-foreground hover:text-foreground"
            >
              <Megaphone className="size-4 text-amber-500" />
              <span>Announcements</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start h-9 gap-2.5 font-medium text-xs text-muted-foreground hover:text-foreground"
            >
              <Bookmark className="size-4 text-blue-500" />
              <span>My Bookmarks</span>
            </Button>
          </CardContent>
        </Card>

        {/* Academic Departments */}
        <Card className="shadow-xs border-border/80">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Departments & Colleges
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-0.5">
            {[
              { id: "CCS", name: "Computer Studies (CCS)", icon: Code2 },
              { id: "COE", name: "Engineering (COE)", icon: Building2 },
              { id: "CBA", name: "Business Admin (CBA)", icon: Users },
              { id: "CAS", name: "Arts & Sciences (CAS)", icon: BookOpen },
              { id: "Events", name: "Events & Competitions", icon: Award },
            ].map((dept) => {
              const Icon = dept.icon
              const isSelected = selectedCategory === dept.id
              return (
                <Button
                  key={dept.id}
                  variant={isSelected ? "secondary" : "ghost"}
                  className="w-full justify-start h-9 gap-2.5 text-xs text-muted-foreground hover:text-foreground truncate"
                  onClick={() => setSelectedCategory(dept.id)}
                >
                  <Icon className="size-4 shrink-0 text-primary/80" />
                  <span className="truncate">{dept.name}</span>
                </Button>
              )
            })}
          </CardContent>
        </Card>
      </aside>

      {/* CENTER FEED: Post Composer & Main Posts List */}
      <section className="lg:col-span-6 space-y-4">
        {/* Post Composer Card (Facebook / Reddit style) */}
        <Card className="shadow-xs border-border/80">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm border border-primary/20">
                {userDisplayName.charAt(0).toUpperCase()}
              </div>
              <Input
                placeholder={`What's on your mind, ${userDisplayName}? Ask or share with UCB...`}
                className="h-10 bg-muted/30 hover:bg-muted/50 text-sm border-border cursor-pointer transition-colors"
              />
            </div>
            <div className="flex items-center justify-between border-t border-border/60 pt-2.5">
              <div className="flex items-center gap-1 sm:gap-2">
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground">
                  <ImageIcon className="size-4 text-emerald-500" />
                  <span className="hidden sm:inline">Media</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground">
                  <Code2 className="size-4 text-blue-500" />
                  <span className="hidden sm:inline">Code / Q&A</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground">
                  <Link2 className="size-4 text-purple-500" />
                  <span className="hidden sm:inline">Link</span>
                </Button>
              </div>
              <Button size="sm" className="h-8 px-4 text-xs font-semibold">
                Post
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feed Filter & Sorting Bar */}
        <div className="flex items-center justify-between gap-2 bg-card p-1.5 rounded-xl border border-border/80 shadow-xs">
          <div className="flex items-center gap-1">
            <Button
              variant={activeTab === "hot" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 text-xs font-medium gap-1.5"
              onClick={() => setActiveTab("hot")}
            >
              <Flame className={`size-3.5 ${activeTab === "hot" ? "text-primary fill-primary" : ""}`} />
              Hot
            </Button>
            <Button
              variant={activeTab === "new" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 text-xs font-medium gap-1.5"
              onClick={() => setActiveTab("new")}
            >
              <Sparkles className={`size-3.5 ${activeTab === "new" ? "text-primary" : ""}`} />
              New
            </Button>
            <Button
              variant={activeTab === "top" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 text-xs font-medium gap-1.5"
              onClick={() => setActiveTab("top")}
            >
              <TrendingUp className={`size-3.5 ${activeTab === "top" ? "text-primary" : ""}`} />
              Top
            </Button>
          </div>
          {selectedCategory !== "All" && (
            <Badge variant="outline" className="text-[11px] gap-1">
              Category: {selectedCategory}
              <button
                onClick={() => setSelectedCategory("All")}
                className="ml-1 hover:text-foreground font-bold"
              >
                ×
              </button>
            </Badge>
          )}
        </div>

        {/* Posts Stream */}
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const voteState = userVotes[post.id]
            const isSaved = !!userSaved[post.id]

            return (
              <Card
                key={post.id}
                className={`transition-all border-border/80 hover:border-border shadow-xs ${
                  post.isPinned ? "bg-card/90 ring-1 ring-primary/20" : ""
                }`}
              >
                <CardHeader className="p-4 pb-2 space-y-2">
                  {/* Category Header & Pinned Tag */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-[10px] font-semibold">
                        {post.category}
                      </Badge>
                      {post.isPinned && (
                        <Badge variant="accent" className="text-[10px] gap-1">
                          <Pin className="size-3 text-primary" /> Pinned
                        </Badge>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="size-3" />
                      {post.createdAt}
                    </span>
                  </div>

                  {/* Author Information */}
                  <div className="flex items-center gap-2.5 pt-1">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-foreground font-bold text-xs">
                      {post.author.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-foreground">
                          {post.author}
                        </span>
                        {post.isVerified && (
                          <CheckCircle2 className="size-3.5 text-primary fill-primary/10" />
                        )}
                        <Badge variant="outline" className="text-[9px] py-0 h-4">
                          {post.role}
                        </Badge>
                      </div>
                      {post.programOrDept && (
                        <span className="text-[10px] text-muted-foreground">
                          {post.programOrDept}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Post Title */}
                  <h2 className="font-heading text-base font-bold text-foreground leading-snug hover:text-primary transition-colors cursor-pointer pt-1">
                    {post.title}
                  </h2>
                </CardHeader>

                <CardContent className="px-4 py-2 space-y-3">
                  <p className="text-xs leading-relaxed text-foreground/90 font-normal">
                    {post.content}
                  </p>

                  {/* Code snippet if present */}
                  {post.codeSnippet && (
                    <div className="rounded-lg bg-muted/70 p-3 font-mono text-[11px] text-foreground/90 overflow-x-auto border border-border/50">
                      <pre>{post.codeSnippet}</pre>
                    </div>
                  )}

                  {/* Hashtags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-medium text-primary hover:underline cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>

                {/* Reddit/Facebook style Action Footer */}
                <CardFooter className="px-4 py-2.5 border-t border-border/60 bg-muted/20 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {/* Upvote/Downvote Group */}
                    <div className="flex items-center bg-muted/60 hover:bg-muted rounded-full p-0.5 border border-border/60">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleVote(post.id, "up")}
                        className={`rounded-full ${
                          voteState === "up" ? "text-primary bg-primary/10 font-bold" : "text-muted-foreground"
                        }`}
                      >
                        <ArrowBigUp className={`size-4 ${voteState === "up" ? "fill-primary" : ""}`} />
                      </Button>
                      <span
                        className={`px-1 text-xs font-semibold ${
                          voteState === "up"
                            ? "text-primary"
                            : voteState === "down"
                            ? "text-destructive"
                            : "text-foreground"
                        }`}
                      >
                        {post.likes}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleVote(post.id, "down")}
                        className={`rounded-full ${
                          voteState === "down" ? "text-destructive bg-destructive/10" : "text-muted-foreground"
                        }`}
                      >
                        <ArrowBigDown className={`size-4 ${voteState === "down" ? "fill-destructive" : ""}`} />
                      </Button>
                    </div>

                    {/* Comment Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground rounded-full px-3"
                    >
                      <MessageCircle className="size-4" />
                      <span>{post.commentsCount} Comments</span>
                    </Button>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Share Button */}
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-muted-foreground hover:text-foreground rounded-full"
                    >
                      <Share2 className="size-3.5" />
                    </Button>

                    {/* Bookmark Button */}
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleSave(post.id)}
                      className={`rounded-full ${
                        isSaved ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Bookmark className={`size-3.5 ${isSaved ? "fill-primary" : ""}`} />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </section>

      {/* RIGHT SIDEBAR: Campus Widgets & Info */}
      <aside className="hidden lg:col-span-3 lg:block space-y-4">
        {/* UCB Forum Info Widget */}
        <Card className="shadow-xs border-border/80">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Shield className="size-4 text-primary" />
              About UCB Forum
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-3 text-xs text-muted-foreground">
            <p>
              The official discussion community for University of Cebu Banilad students, faculty, and academic departments.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-center">
              <div className="bg-muted/40 p-2 rounded-lg">
                <span className="block font-bold text-sm text-foreground">14.2k</span>
                <span className="text-[10px]">Members</span>
              </div>
              <div className="bg-muted/40 p-2 rounded-lg">
                <span className="block font-bold text-sm text-emerald-600">1.8k</span>
                <span className="text-[10px]">Online Now</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-3 bg-muted/20 border-t border-border/60">
            <Button size="sm" className="w-full text-xs font-semibold">
              Create New Post
            </Button>
          </CardFooter>
        </Card>

        {/* Campus Announcements */}
        <Card className="shadow-xs border-border/80">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Megaphone className="size-3.5 text-amber-500" />
              Campus Bulletins
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2.5 text-xs">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-foreground space-y-1">
              <div className="font-semibold text-amber-900 dark:text-amber-300">
                Enrollment Verification
              </div>
              <p className="text-[11px] text-muted-foreground">
                Verified student badges are required for program specific channels.
              </p>
            </div>
            <div className="space-y-2 pt-1">
              <a href="#" className="block hover:underline font-medium text-foreground group">
                <div className="flex items-center justify-between">
                  <span className="text-xs group-hover:text-primary">Library Operating Hours</span>
                  <ChevronRight className="size-3 text-muted-foreground" />
                </div>
                <span className="text-[10px] text-muted-foreground">Mon-Sat: 7:30 AM - 7:00 PM</span>
              </a>
              <div className="border-t border-border/40" />
              <a href="#" className="block hover:underline font-medium text-foreground group">
                <div className="flex items-center justify-between">
                  <span className="text-xs group-hover:text-primary">Guidance & Counseling Office</span>
                  <ChevronRight className="size-3 text-muted-foreground" />
                </div>
                <span className="text-[10px] text-muted-foreground">Free Consultation Appointments</span>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Trending Hashtags */}
        <Card className="shadow-xs border-border/80">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Trending Topics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2 text-xs">
            {[
              { tag: "#Midterms2026", count: "342 posts" },
              { tag: "#CapStoneDefenses", count: "189 posts" },
              { tag: "#UCBHackathon", count: "115 posts" },
              { tag: "#CampusWiFi", count: "98 posts" },
            ].map((topic) => (
              <div key={topic.tag} className="flex items-center justify-between hover:bg-muted/50 p-1.5 rounded-md cursor-pointer">
                <span className="font-medium text-primary">{topic.tag}</span>
                <span className="text-[10px] text-muted-foreground">{topic.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}
