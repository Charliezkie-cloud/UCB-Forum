import { Ghost } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function DeletedGhostBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 border-dashed border-muted-foreground/45 bg-muted/60 font-normal text-muted-foreground",
        className,
      )}
    >
      <Ghost className="size-3" />
      Deleted
    </Badge>
  )
}

export function ghostPostClassName(isDeleted: boolean, className?: string) {
  return cn(
    isDeleted &&
      "border-dashed border-muted-foreground/35 bg-muted/25 opacity-70 grayscale-[0.4]",
    className,
  )
}
