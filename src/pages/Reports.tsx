import { useState } from 'react'
import { REPORTS, type ReportType } from '../data/mockData'
import { IconDownload, IconFilter } from '../icons/Icons'

const TYPE_COLORS: Record<ReportType, string> = {
  Revenue:    'var(--accent)',
  Users:      'var(--primary)',
  Conversion: 'var(--sky)',
  Churn:      'var(--coral)',
}

const ALL_TYPES: Array<'All' | ReportType> = ['All', 'Revenue', 'Users', 'Conversion', 'Churn']

export default function Reports() {
  const [activeFilter, setActiveFilter] = useState<'All' | ReportType>('All')

  const filtered = activeFilter === 'All'
    ? REPORTS
    : REPORTS.filter(r => r.type === activeFilter)

  return (
    <div className="page-reports">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <p className="page-super">Data & Insights</p>
          <h1 className="page-title">Reports</h1>
        </div>
        <button id="btn-new-report" className="btn-export">+ New Report</button>
      </div>

      {/* Filter Chips */}
      <div className="reports-filters" role="group" aria-label="Filter reports">
        {ALL_TYPES.map(type => (
          <button
            key={type}
            id={`filter-${type.toLowerCase()}`}
            className={`filter-chip${activeFilter === type ? ' active' : ''}`}
            onClick={() => setActiveFilter(type)}
          >
            {type}
          </button>
        ))}
        <span className="reports-count">{filtered.length} reports</span>
      </div>

      {/* Reports List */}
      <div className="reports-list">
        {filtered.map(report => (
          <div key={report.id} id={`report-${report.id}`} className="report-row">
            {/* Type indicator */}
            <span
              className="report-type-bar"
              style={{ background: TYPE_COLORS[report.type] }}
            />

            {/* Info */}
            <div className="report-info">
              <div className="report-name">{report.name}</div>
              <div className="report-meta">
                <span
                  className="report-type-badge"
                  style={{
                    background: TYPE_COLORS[report.type] + '22',
                    color: TYPE_COLORS[report.type],
                  }}
                >
                  {report.type}
                </span>
                <span className="report-date">{report.date}</span>
                <span className="report-size">{report.size}</span>
              </div>
            </div>

            {/* Status */}
            <span className={`status-badge ${
              report.status === 'Ready'      ? 'status-success' :
              report.status === 'Processing' ? 'status-processing' :
                                               'status-failed'
            }`}>
              <span className="status-dot" />
              {report.status}
            </span>

            {/* Actions */}
            <div className="report-actions">
              <button
                className="icon-btn"
                title="Filter"
                disabled={report.status !== 'Ready'}
              >
                <IconFilter />
              </button>
              <button
                className={`btn-download-report${report.status !== 'Ready' ? ' disabled' : ''}`}
                disabled={report.status !== 'Ready'}
                title="Download"
              >
                <IconDownload /> Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
