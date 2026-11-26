import type { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'


interface Props {
  eyebrow?: string
  title: ReactNode
  description?: string
  action?: ReactNode
  rightNote?: string
}

export default function PageHeader({ eyebrow, title, description, action, rightNote }: Props) {
  return <div className="page-header">
    <div className="page-heading-copy">
      {eyebrow && <div className="eyebrow"><span className="eyebrow-line"/>{eyebrow}</div>}
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
    <div className="page-header-actions">{rightNote && <span className="header-note">{rightNote}<ArrowUpRight size={13}/></span>}{action}</div>
  </div>
}
