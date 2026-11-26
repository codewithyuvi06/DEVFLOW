import type { FormEvent, ReactNode } from 'react'
import { X } from 'lucide-react'

interface Props { title: string; description?: string; onClose: () => void; onSubmit?: (e: FormEvent<HTMLFormElement>) => void; children: ReactNode; submitLabel?: string }
export default function Modal({ title, description, onClose, onSubmit, children, submitLabel = 'Create' }: Props) {
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-head"><div><h2 id="modal-title">{title}</h2>{description && <p>{description}</p>}</div><button className="icon-button" onClick={onClose} aria-label="Close modal"><X size={19}/></button></div>
      <form onSubmit={onSubmit}><div className="modal-body">{children}</div><div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary">{submitLabel}</button></div></form>
    </section>
  </div>
}
