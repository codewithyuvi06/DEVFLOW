import { useEffect, useState } from 'react'
import { Bell, Check, CircleUserRound, Github, LockKeyhole, Palette, Save, Shield, SlidersHorizontal } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../services/api'

export default function SettingsPage() {
const { user, refreshUser } = useAuth()

const [section, setSection] = useState('Profile')
const [name, setName] = useState('')
const [email, setEmail] = useState('')
const [saved, setSaved] = useState(false)
const [saving, setSaving] = useState(false)
const [error, setError] = useState('')
const [toggles, setToggles] = useState({ product: true, issues: true, weekly: false, email: true, compact: false })

useEffect(() => {
  if (user) {
    setName(user.name)
    setEmail(user.email)

    setToggles({
      product: user.preferences?.productUpdates ?? true,
      issues: user.preferences?.issueAssignments ?? true,
      weekly: user.preferences?.weeklyDigest ?? false,
      email: user.preferences?.emailNotifications ?? true,
      compact: user.preferences?.compactDensity ?? false,
    })
  }
}, [user])
  const nav = [
    { label: 'Profile', icon: CircleUserRound }, { label: 'Preferences', icon: SlidersHorizontal },
    { label: 'Notifications', icon: Bell }, { label: 'Appearance', icon: Palette },
    { label: 'Integrations', icon: Github }, { label: 'Security', icon: LockKeyhole },
  ]
  function toggle(key: keyof typeof toggles) { setToggles(current => ({ ...current, [key]: !current[key] })); setSaved(false) } 
  async function handleSave() {
  setSaving(true)
  setError('')
  setSaved(false)

  try {
    await apiRequest('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify({
  name: name.trim(),
  preferences: {
    productUpdates: toggles.product,
    issueAssignments: toggles.issues,
    weeklyDigest: toggles.weekly,
    emailNotifications: toggles.email,
    compactDensity: toggles.compact,
  },
}),
    })

    await refreshUser()
    setSaved(true)
  } catch (err) {
    setError(
      err instanceof Error ? err.message : 'Unable to save changes.',
    )
  } finally {
    setSaving(false)
  }
}
function connectGitHub() {
  window.location.href = 'http://localhost:4000/api/v1/integrations/github/start?state=devflow-github-connect-2026'
}
  return <div className="page-stack">
    <PageHeader eyebrow="MAKE IT YOURS" title="Settings" description="Manage your profile, preferences, and workspace connections." action={<button className="button button-primary" onClick={handleSave}
disabled={saving || !name.trim()}>{saved ? <Check size={16}/> : <Save size={16}/>}
{saving ? 'Saving...' : saved ? 'Saved' : 'Save changes'}</button>}/>
    {error && (
  <p className="auth-error" role="alert">
    {error}
  </p>
)}<div className="settings-layout"><aside className="settings-nav">{nav.map(({label, icon: Icon}) => <button key={label} className={section === label ? 'active' : ''} onClick={() => setSection(label)}><Icon size={17}/>{label}</button>)}</aside><section className="settings-content">
      {section === 'Profile' && <><div className="settings-section-head"><h2>Profile information</h2><p>Update your personal details and how others see you.</p></div><div className="profile-edit-card"><div className="avatar avatar-user avatar-xl">
  {user?.name?.slice(0, 2).toUpperCase()}
</div><div><strong>Profile photo</strong><p>Initials are used until a profile image is connected.</p><button className="button button-secondary button-small" onClick={() => window.alert('Image upload will be added with profile storage.')}>Change photo</button></div></div><label className="form-label">Full name<input className="form-input" value={name} onChange={e => {setName(e.target.value); setSaved(false)}}/></label><label className="form-label">
  Email address
  <input
    className="form-input"
    type="email"
    value={email}
    readOnly
  />
</label><label className="form-label">Role<input className="form-input" value="Aspiring AI & Full-Stack Developer" readOnly/></label></>}
      {section === 'Preferences' && <><div className="settings-section-head"><h2>Workspace preferences</h2><p>Choose how DEVFLOW behaves while you work.</p></div><ToggleRow title="Compact density" description="Reduce spacing in lists and tables." checked={toggles.compact} onChange={() => toggle('compact')}/><ToggleRow title="Show keyboard shortcuts" description="Display shortcuts in menus and search." checked={true} onChange={() => window.alert('Keyboard shortcut visibility is always enabled in this preview.')}/><div className="settings-info-note">
  Your workspace preferences are saved securely to your DEVFLOW account.
</div></>}
      {section === 'Notifications' && <><div className="settings-section-head"><h2>Notification preferences</h2><p>Choose what you want to hear about.</p></div><ToggleRow title="Product updates" description="News about features and improvements." checked={toggles.product} onChange={() => toggle('product')}/><ToggleRow title="Issue assignments" description="When an issue is assigned to you or updated." checked={toggles.issues} onChange={() => toggle('issues')}/><ToggleRow title="Weekly digest" description="A summary of workspace activity every week." checked={toggles.weekly} onChange={() => toggle('weekly')}/><ToggleRow title="Email notifications" description="Receive important updates by email." checked={toggles.email} onChange={() => toggle('email')}/></>}
      {section === 'Appearance' && <><div className="settings-section-head"><h2>Appearance</h2><p>DEVFLOW's violet-on-black visual identity.</p></div><div className="palette-preview"><div style={{background:'#000000'}}/><div style={{background:'#3E065F'}}/><div style={{background:'#700B97'}}/><div style={{background:'#8E05C2'}}/></div><div className="palette-labels"><span>#000000</span><span>#3E065F</span><span>#700B97</span><span>#8E05C2</span></div><ToggleRow title="Compact density" description="Use tighter spacing throughout the workspace." checked={toggles.compact} onChange={() => toggle('compact')}/><div className="settings-info-note">The brand palette is fixed to your selected colors. Contrast and status colors use supporting tokens.</div></>}
      {section === 'Integrations' && <><div className="settings-section-head"><h2>Connected apps</h2><p>Bring the tools your team uses into one workflow.</p></div><div className="integration-row">
  <div className="integration-logo github-logo">
    <Github size={23}/>
  </div>

  <div className="integration-copy">
    <strong>GitHub</strong>
    <p>Repositories, pull requests, issues, and code activity.</p>
  </div>

  <span className="integration-status">Not connected</span>

  <button
    className="button button-secondary button-small"
    onClick={connectGitHub}
  >
    Connect
  </button>
</div></>}
      {section === 'Security' && <><div className="settings-section-head"><h2>Security & access</h2><p>Account protection and workspace access controls.</p></div><div className="security-callout">
  <Shield size={20}/>
  <div>
    <strong>Account authentication is active</strong>
    <p>Your account is protected by backend authentication and session-based access control.</p>
  </div>
</div><div className="security-setting"><div><strong>Two-factor authentication</strong><p>Require an extra verification step when signing in.</p></div><span className="integration-status">Unavailable in preview</span></div><div className="security-setting"><div><strong>Active sessions</strong><p>Review and revoke sessions for your account.</p></div><span className="integration-status">Unavailable in preview</span></div></>}
    </section></div>
    {saved && (
  <div className="save-toast">
    <Check size={15}/> Profile updated successfully.
  </div>
)}
  </div>
}
function ToggleRow({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: () => void }) {
  return <div className="toggle-row"><div><strong>{title}</strong><p>{description}</p></div><button role="switch" aria-checked={checked} className={`switch ${checked ? 'switch-on' : ''}`} onClick={onChange}><span/></button></div>
}
