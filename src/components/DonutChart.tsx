import { SEGMENTS } from '../data/mockData'
import { DONUT_R, DONUT_C } from '../utils/chart'

export default function DonutChart() {
  let cumPct = 0

  return (
    <div className="chart-card donut-card">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">User Segments</h3>
          <p className="chart-sub">Demographics by subscription tier</p>
        </div>
      </div>

      <div className="donut-body">
        <svg viewBox="0 0 200 200" width="168" height="168">
          {/* Track ring */}
          <circle
            cx="100" cy="100" r={DONUT_R}
            fill="none"
            stroke="rgba(43,168,162,0.06)"
            strokeWidth="26"
          />

          {SEGMENTS.map((seg, i) => {
            const len    = DONUT_C * (seg.pct / 100)
            const offset = -(DONUT_C * cumPct / 100)
            cumPct += seg.pct
            return (
              <circle
                key={i}
                cx="100" cy="100" r={DONUT_R}
                fill="none"
                stroke={seg.color}
                strokeWidth="26"
                strokeDasharray={`${len} ${DONUT_C - len}`}
                strokeDashoffset={offset}
                transform="rotate(-90, 100, 100)"
                strokeLinecap="butt"
              />
            )
          })}

          {/* Center text */}
          <text x="100" y="95"  textAnchor="middle" fontSize="24" fontWeight="800" fill="#1E8C86" fontFamily="Nunito, sans-serif">100%</text>
          <text x="100" y="112" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#6A9090" fontFamily="Nunito, sans-serif" letterSpacing="1.5">TOTAL</text>
        </svg>

        <div className="donut-legend">
          {SEGMENTS.map(seg => (
            <div key={seg.label} className="donut-legend-row">
              <span className="donut-dot"          style={{ background: seg.color }} />
              <span className="donut-legend-label">{seg.label}</span>
              <span className="donut-legend-pct">  {seg.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
