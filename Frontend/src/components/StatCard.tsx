import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

interface Props { label: string; value: string; change: string; trend?: 'up' | 'down' | 'neutral'; icon: LucideIcon; tone?: string; caption?: string }
export default function StatCard({ label, value, change, trend = 'up', icon: Icon, tone = 'purple', caption }: Props) {
  return <div className="stat-card">
    <div className="stat-top"><span>{label}</span><div className={`stat-icon ${tone}`}><Icon size={18}/></div></div>
    <div className="stat-value-row"><strong>{value}</strong><span className={`stat-change ${trend}`}>{trend === 'down' ? <ArrowDownRight size={13}/> : <ArrowUpRight size={13}/>} {change}</span></div>
    <div className="stat-caption">{caption ?? 'vs. previous 30 days'}</div>
  </div>
}
