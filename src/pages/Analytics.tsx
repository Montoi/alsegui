import KPICard         from '../components/KPICard'
import RevenueChart    from '../components/RevenueChart'
import DonutChart      from '../components/DonutChart'
import ActivityTable   from '../components/ActivityTable'
import { KPI_DATA }    from '../data/mockData'
import { IconCalendar } from '../icons/Icons'

export default function Analytics() {
  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <p className="page-super">Performance Overview</p>
          <h1 className="page-title">Analytics Dashboard</h1>
        </div>
        <div className="page-actions">
          <button id="btn-date" className="btn-date">
            <IconCalendar /> Last 30 Days
          </button>
          <button id="btn-export" className="btn-export">Export Data</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {KPI_DATA.map(card => (
          <KPICard key={card.id} {...card} />
        ))}
      </div>

      {/* Charts */}
      <div className="charts-row">
        <RevenueChart />
        <DonutChart />
      </div>

      {/* Activity */}
      <ActivityTable />

      {/* Footer */}
      <footer className="dash-footer">
        <span className="footer-copy">© 2024 Flip7 Analytics. Built for Playmakers.</span>
        <div className="footer-links">
          <a href="#" onClick={e => e.preventDefault()}>Privacy</a>
          <a href="#" onClick={e => e.preventDefault()}>Terms</a>
          <a href="#" onClick={e => e.preventDefault()}>API Docs</a>
        </div>
      </footer>
    </>
  )
}
