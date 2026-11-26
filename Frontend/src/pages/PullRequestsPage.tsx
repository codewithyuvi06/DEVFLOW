import { useMemo, useState } from 'react'
import { CheckCircle2, GitPullRequest, MessageSquare, Search, ShieldAlert } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import { pullRequests } from '../data/mockData'

export default function PullRequestsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All pull requests')
  const [toast, setToast] = useState('')
  const items = useMemo(() => pullRequests.filter(pr => `${pr.title} ${pr.repo} ${pr.author} #${pr.id}`.toLowerCase().includes(search.toLowerCase()) && (filter === 'All pull requests' || pr.status === filter)), [search, filter])
  return <div className="page-stack">
    <PageHeader eyebrow="COLLABORATE & REVIEW" title="Pull requests" description="Review changes, follow checks, and keep quality high."/>
    <div className="pr-summary-grid"><div className="pr-summary-card"><GitPullRequest size={18}/><span>Open pull requests</span><strong>4</strong></div><div className="pr-summary-card"><MessageSquare size={18}/><span>Awaiting your review</span><strong>2</strong></div><div className="pr-summary-card"><CheckCircle2 size={18}/><span>Checks passing</span><strong>3</strong></div><div className="pr-summary-card"><ShieldAlert size={18}/><span>Needs attention</span><strong>1</strong></div></div>
    <div className="toolbar"><div className="search-field"><Search size={16}/><input placeholder="Search pull requests..." value={search} onChange={e => setSearch(e.target.value)}/></div><div className="filter-select-wrap"><select value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter pull requests"><option>All pull requests</option><option>Ready for review</option><option>Review requested</option><option>Draft</option><option>Changes requested</option></select></div></div>
    <div className="pr-list">{items.map(pr => <article className="pr-row" key={pr.id}><div className="pr-icon"><GitPullRequest size={20}/></div><div className="pr-main"><div className="pr-title-line"><h3>{pr.title}</h3><span className={`pr-state state-${pr.status.toLowerCase().replaceAll(' ', '-')}`}>{pr.status}</span></div><div className="pr-meta"><span className="pr-number">#{pr.id}</span><span>in <strong>{pr.repo}</strong></span><span>opened by <strong>{pr.author}</strong></span><span>{pr.updated}</span></div><div className="pr-checks"><span className={pr.checks.includes('passed') ? 'check-ok' : 'check-pending'}>{pr.checks.includes('passed') ? <CheckCircle2 size={14}/> : <span className="mini-spinner"/>}{pr.checks}</span><span><MessageSquare size={14}/>{pr.comments} comments</span></div></div><button className="button button-secondary review-button" onClick={() => setToast(`PR #${pr.id}: review details will load from GitHub after integration.`)}>Review <span>↗</span></button></article>)}{!items.length && <EmptyState icon={GitPullRequest} title="No pull requests found" description="Try another search or status filter."/>}</div>
    {toast && <div className="inline-toast"><GitPullRequest size={15}/>{toast}<button onClick={() => setToast('')}>Dismiss</button></div>}
    <div className="data-disclaimer">Pull requests are preview records. Live reviews, checks, and comments require GitHub integration.</div>
  </div>
}
