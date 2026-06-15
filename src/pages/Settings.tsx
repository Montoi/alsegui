import { useState } from 'react'
import { IconUser, IconMail, IconCreditCard } from '../icons/Icons'

interface ToggleProps {
  id: string
  label: string
  description?: string
  defaultChecked?: boolean
}

function Toggle({ id, label, description, defaultChecked = false }: ToggleProps) {
  const [on, setOn] = useState(defaultChecked)
  return (
    <div className="settings-toggle-row">
      <div className="settings-toggle-text">
        <span className="settings-toggle-label">{label}</span>
        {description && <span className="settings-toggle-desc">{description}</span>}
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={on}
        className={`toggle-btn${on ? ' on' : ''}`}
        onClick={() => setOn(v => !v)}
      >
        <span className="toggle-thumb" />
      </button>
    </div>
  )
}

export default function Settings() {
  return (
    <div className="page-settings">
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <p className="page-super">Account & Preferences</p>
          <h1 className="page-title">Settings</h1>
        </div>
        <button id="btn-save-settings" className="btn-export">Save Changes</button>
      </div>

      <div className="settings-grid">

        {/* ── Profile ── */}
        <section className="settings-card" id="settings-profile">
          <div className="settings-card-header">
            <span className="settings-card-icon"><IconUser /></span>
            <h2 className="settings-card-title">Profile</h2>
          </div>

          <div className="settings-avatar-row">
            <div className="settings-avatar">CG</div>
            <div>
              <div className="settings-avatar-name">Carlos García</div>
              <div className="settings-avatar-role">Admin · Enterprise Plan</div>
              <button className="settings-link-btn">Change photo</button>
            </div>
          </div>

          <div className="settings-fields">
            <div className="settings-field">
              <label htmlFor="input-name">Full Name</label>
              <input id="input-name" type="text" defaultValue="Carlos García" />
            </div>
            <div className="settings-field">
              <label htmlFor="input-email">Email Address</label>
              <div className="settings-input-icon">
                <IconMail />
                <input id="input-email" type="email" defaultValue="carlos@flip7.io" />
              </div>
            </div>
            <div className="settings-field">
              <label htmlFor="input-role">Role</label>
              <input id="input-role" type="text" defaultValue="Product Manager" />
            </div>
          </div>
        </section>

        {/* ── Notifications ── */}
        <section className="settings-card" id="settings-notifications">
          <div className="settings-card-header">
            <span className="settings-card-icon">🔔</span>
            <h2 className="settings-card-title">Notifications</h2>
          </div>

          <div className="settings-toggles">
            <Toggle id="toggle-email"   label="Email Alerts"      description="Receive alerts when KPIs change significantly" defaultChecked />
            <Toggle id="toggle-push"    label="Push Notifications" description="Browser notifications for real-time updates" />
            <Toggle id="toggle-weekly"  label="Weekly Digest"      description="Summary report every Monday morning" defaultChecked />
            <Toggle id="toggle-reports" label="Report Ready"       description="Notify when a new report is available" defaultChecked />
          </div>
        </section>

        {/* ── Billing ── */}
        <section className="settings-card settings-card-full" id="settings-billing">
          <div className="settings-card-header">
            <span className="settings-card-icon"><IconCreditCard /></span>
            <h2 className="settings-card-title">Billing & Plan</h2>
          </div>

          <div className="billing-plan-row">
            <div className="billing-plan-info">
              <span className="billing-plan-badge">Enterprise</span>
              <div className="billing-plan-price">$299 <span>/month</span></div>
              <div className="billing-plan-renew">Next billing: November 1, 2024</div>
            </div>
            <button id="btn-manage-plan" className="btn-date">Manage Plan</button>
          </div>

          <div className="billing-usage">
            <div className="billing-usage-label">
              <span>API Usage</span>
              <span>84,232 / 100,000 calls</span>
            </div>
            <div className="billing-bar">
              <div className="billing-bar-fill" style={{ width: '84%' }} />
            </div>
          </div>

          <div className="billing-usage">
            <div className="billing-usage-label">
              <span>Storage</span>
              <span>18.4 GB / 50 GB</span>
            </div>
            <div className="billing-bar">
              <div className="billing-bar-fill teal" style={{ width: '37%' }} />
            </div>
          </div>

          <div className="billing-usage">
            <div className="billing-usage-label">
              <span>Team Seats</span>
              <span>7 / 20 members</span>
            </div>
            <div className="billing-bar">
              <div className="billing-bar-fill sky" style={{ width: '35%' }} />
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
