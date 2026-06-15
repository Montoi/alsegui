import { ACTIVITY } from '../data/mockData'
import { IconFilter, IconDownload } from '../icons/Icons'

export default function ActivityTable() {
  return (
    <div className="activity-card">
      <div className="activity-header">
        <h3 className="chart-title">Recent Activity</h3>
        <div className="activity-actions">
          <button id="btn-filter"   className="icon-btn" title="Filter">
            <IconFilter />
          </button>
          <button id="btn-download" className="icon-btn" title="Download">
            <IconDownload />
          </button>
        </div>
      </div>

      <table className="activity-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Plan</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {ACTIVITY.map((row, i) => (
            <tr key={i} id={`activity-row-${i}`}>
              <td>
                <div className="user-cell">
                  <div className="table-avatar" style={{ background: row.bg }}>
                    {row.initials}
                  </div>
                  <div>
                    <div className="user-name">{row.name}</div>
                    <div className="user-email">{row.email}</div>
                  </div>
                </div>
              </td>
              <td className="plan-cell">{row.plan}</td>
              <td>
                <span className={`status-badge ${row.status === 'Success' ? 'status-success' : 'status-failed'}`}>
                  <span className="status-dot" />
                  {row.status}
                </span>
              </td>
              <td className="date-cell">{row.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
