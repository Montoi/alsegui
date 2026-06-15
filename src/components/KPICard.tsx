import type { KPIItem } from '../data/mockData'

export default function KPICard({ id, label, value, change, positive, optimal, icon, iconBg, iconColor }: KPIItem) {
  return (
    <div className="kpi-card" id={`kpi-${id}`}>
      <div className="kpi-top">
        <div className="kpi-icon" style={{ background: iconBg, color: iconColor }}>
          {icon}
        </div>

        {optimal
          ? <span className="badge badge-optimal">Optimal</span>
          : <span className={`badge ${positive ? 'badge-pos' : 'badge-neg'}`}>{change}</span>
        }
      </div>

      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
    </div>
  )
}
