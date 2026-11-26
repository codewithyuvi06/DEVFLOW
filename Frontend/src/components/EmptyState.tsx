import type { LucideIcon } from 'lucide-react'
import { Search } from 'lucide-react'

export default function EmptyState({ icon: Icon = Search, title, description }: { icon?: LucideIcon; title: string; description: string }) {
  return <div className="empty-state"><div className="empty-icon"><Icon size={22}/></div><h3>{title}</h3><p>{description}</p></div>
}
