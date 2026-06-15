import { HOME_STATS } from '../data/mockData'
import { IconArrowRight } from '../icons/Icons'
import type { Page } from '../types'

interface HomeProps {
  onNavigate: (page: Page) => void
}

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="page-home">
      {/* Welcome Banner */}
      <div className="home-banner">
        <div className="home-banner-text">
          <p className="home-banner-eyebrow">👋 Welcome back</p>
          <h1 className="home-banner-title">Good afternoon, Carlos</h1>
          <p className="home-banner-sub">
            Here's what's happening with your platform today.
          </p>
          <button
            id="home-go-analytics"
            className="home-banner-btn"
            onClick={() => onNavigate('analytics')}
          >
            View Analytics <IconArrowRight />
          </button>
        </div>
        <div className="home-banner-graphic" aria-hidden>
          <span className="banner-graphic-circle c1" />
          <span className="banner-graphic-circle c2" />
          <span className="banner-graphic-circle c3" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="home-stats">
        {HOME_STATS.map((stat, i) => (
          <div key={i} className="home-stat-card" id={`home-stat-${i}`}>
            <div className="home-stat-icon">{stat.icon}</div>
            <div className="home-stat-body">
              <div className="home-stat-label">{stat.label}</div>
              <div className="home-stat-value">{stat.value}</div>
            </div>
            <span className={`badge ${stat.positive ? 'badge-pos' : 'badge-neg'} home-stat-badge`}>
              {stat.trend}
            </span>
          </div>
        ))}
      </div>

      {/* Quick Access */}
      <section className="home-quick">
        <h2 className="home-section-title">Quick Access</h2>
        <div className="home-quick-grid">
          {[
            { page: 'analytics' as Page, icon: '📊', title: 'Analytics',    desc: 'Revenue trends, KPIs and user segments' },
            { page: 'reports'   as Page, icon: '📋', title: 'Reports',      desc: 'Download and filter your generated reports' },
            { page: 'settings'  as Page, icon: '⚙️', title: 'Settings',     desc: 'Profile, notifications and billing' },
          ].map(item => (
            <button
              key={item.page}
              id={`home-quick-${item.page}`}
              className="home-quick-card"
              onClick={() => onNavigate(item.page)}
            >
              <span className="home-quick-icon">{item.icon}</span>
              <span className="home-quick-title">{item.title}</span>
              <span className="home-quick-desc">{item.desc}</span>
              <span className="home-quick-arrow"><IconArrowRight /></span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
