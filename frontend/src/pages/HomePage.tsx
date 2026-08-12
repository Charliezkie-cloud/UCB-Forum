import { CategoriesSidebarCard } from "@/components/categories/CategoriesSidebarCard"

export function HomePage() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <aside className="lg:col-span-3">
        <CategoriesSidebarCard />
      </aside>
    </div>
  )
}
