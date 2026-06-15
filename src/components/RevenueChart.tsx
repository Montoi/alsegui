import { MONTHS, ACTUAL_PCTS, TARGET_PCTS } from '../data/mockData'
import { CW, CH, PX, PY, toPoints, makePath, makeAreaPath } from '../utils/chart'

export default function RevenueChart() {
  const actual = toPoints(ACTUAL_PCTS)
  const target = toPoints(TARGET_PCTS)

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Revenue Trends over Time</h3>
          <p className="chart-sub">Projected vs actual growth for Q3</p>
        </div>
        <div className="chart-legend">
          <span className="legend-item">
            <span className="legend-dot" style={{ background: 'var(--primary)' }} />
            ACTUAL
          </span>
          <span className="legend-item">
            <span className="legend-dash-line" />
            TARGET
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${CW} ${CH + 28}`}
        className="line-chart"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="lineAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#2BA8A2" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#2BA8A2" stopOpacity="0.01" />
          </linearGradient>
          <filter id="lineShadow" x="-5%" y="-5%" width="110%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#2BA8A2" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Soft horizontal gridlines */}
        {[0.25, 0.5, 0.75].map(f => (
          <line
            key={f}
            x1={PX} y1={PY + f * (CH - 2 * PY)}
            x2={CW - PX} y2={PY + f * (CH - 2 * PY)}
            stroke="rgba(43,168,162,0.07)"
            strokeWidth="1"
          />
        ))}

        {/* Area fill under actual line */}
        <path d={makeAreaPath(actual)} fill="url(#lineAreaGrad)" />

        {/* Target line — dashed */}
        <path
          d={makePath(target)}
          fill="none"
          stroke="#AECFCE"
          strokeWidth="1.8"
          strokeDasharray="5 4"
          strokeLinecap="round"
        />

        {/* Actual line */}
        <path
          d={makePath(actual)}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#lineShadow)"
        />

        {/* Endpoint dot */}
        <circle
          cx={actual[actual.length - 1].x}
          cy={actual[actual.length - 1].y}
          r="4.5"
          fill="var(--primary)"
          stroke="white"
          strokeWidth="2"
        />

        {/* Month labels */}
        {MONTHS.map((m, i) => {
          const x = PX + i * ((CW - 2 * PX) / (MONTHS.length - 1))
          return (
            <text
              key={m}
              x={x}
              y={CH + 20}
              textAnchor="middle"
              fontSize="11"
              fill="#6A9090"
              fontFamily="Nunito, sans-serif"
              fontWeight="600"
            >
              {m}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
