import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

function getPageItems(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const items: Array<number | "ellipsis"> = [1]

  if (current > 3) {
    items.push("ellipsis")
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let page = start; page <= end; page += 1) {
    items.push(page)
  }

  if (current < total - 2) {
    items.push("ellipsis")
  }

  items.push(total)
  return items
}

export function PostsPagination({
  page,
  totalPages,
  disabled = false,
  onPageChange,
}: {
  page: number
  totalPages: number
  disabled?: boolean
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  const items = getPageItems(page, totalPages)

  return (
    <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
      <p className="text-xs text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              aria-disabled={page <= 1 || disabled}
              className={page <= 1 || disabled ? "pointer-events-none opacity-50" : undefined}
              onClick={(event) => {
                event.preventDefault()
                if (page <= 1 || disabled) return
                onPageChange(page - 1)
              }}
            />
          </PaginationItem>

          {items.map((item, index) =>
            item === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                <PaginationLink
                  href="#"
                  isActive={item === page}
                  aria-disabled={disabled}
                  className={disabled ? "pointer-events-none opacity-50" : undefined}
                  onClick={(event) => {
                    event.preventDefault()
                    if (disabled || item === page) return
                    onPageChange(item)
                  }}
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              aria-disabled={page >= totalPages || disabled}
              className={
                page >= totalPages || disabled ? "pointer-events-none opacity-50" : undefined
              }
              onClick={(event) => {
                event.preventDefault()
                if (page >= totalPages || disabled) return
                onPageChange(page + 1)
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
