import type { ReactNode } from 'react'

// ─── ReportType ───────────────────────────────────────────────────────────────

export type ReportType = 'Revenue' | 'Users' | 'Conversion' | 'Churn'

// ─── KPIItem ──────────────────────────────────────────────────────────────────

export interface KPIItem {
  id: string
  label: string
  value: string
  change: string
  positive: boolean
  optimal?: boolean
  icon: ReactNode
  iconBg: string
  iconColor: string
}

// ─── Revenue Chart data ───────────────────────────────────────────────────────

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
export const ACTUAL_PCTS  = [30, 55, 45, 70, 60, 80, 75]
export const TARGET_PCTS  = [40, 50, 55, 60, 65, 70, 72]

// ─── Donut chart segments ─────────────────────────────────────────────────────

export const SEGMENTS = [
  { label: 'Enterprise', pct: 38, color: '#2BA8A2' },
  { label: 'Pro',        pct: 30, color: '#5B7FFF' },
  { label: 'Starter',   pct: 20, color: '#F9A94B' },
  { label: 'Free',      pct: 12, color: '#FF6B8A' },
]

// ─── KPI cards ────────────────────────────────────────────────────────────────

export const KPI_DATA: KPIItem[] = [
  {
    id: 'revenue',
    label: 'Total Revenue',
    value: '$84,254',
    change: '+12.5%',
    positive: true,
    icon: '💰',
    iconBg: 'rgba(43,168,162,0.12)',
    iconColor: '#2BA8A2',
  },
  {
    id: 'users',
    label: 'Active Users',
    value: '3,842',
    change: '+8.1%',
    positive: true,
    icon: '👥',
    iconBg: 'rgba(91,127,255,0.12)',
    iconColor: '#5B7FFF',
  },
  {
    id: 'conversion',
    label: 'Conversion Rate',
    value: '4.6%',
    change: '±0%',
    positive: true,
    optimal: true,
    icon: '📈',
    iconBg: 'rgba(249,169,75,0.12)',
    iconColor: '#F9A94B',
  },
  {
    id: 'churn',
    label: 'Churn Rate',
    value: '1.2%',
    change: '-0.4%',
    positive: true,
    icon: '🔄',
    iconBg: 'rgba(255,107,138,0.12)',
    iconColor: '#FF6B8A',
  },
]

// ─── Activity table rows ──────────────────────────────────────────────────────

export const ACTIVITY = [
  { name: 'Alice Johnson',  email: 'alice@example.com',  initials: 'AJ', bg: '#2BA8A2', plan: 'Enterprise', status: 'Success', date: 'Jun 10, 2024' },
  { name: 'Bob Martinez',   email: 'bob@example.com',    initials: 'BM', bg: '#5B7FFF', plan: 'Pro',        status: 'Success', date: 'Jun 9, 2024'  },
  { name: 'Carol Smith',    email: 'carol@example.com',  initials: 'CS', bg: '#F9A94B', plan: 'Starter',    status: 'Failed',  date: 'Jun 8, 2024'  },
  { name: 'David Lee',      email: 'david@example.com',  initials: 'DL', bg: '#FF6B8A', plan: 'Enterprise', status: 'Success', date: 'Jun 7, 2024'  },
  { name: 'Eva Chen',       email: 'eva@example.com',    initials: 'EC', bg: '#2BA8A2', plan: 'Pro',        status: 'Success', date: 'Jun 6, 2024'  },
]

// ─── Home stats ───────────────────────────────────────────────────────────────

export const HOME_STATS = [
  { icon: '💰', label: 'Monthly Revenue',  value: '$84,254',  trend: '+12.5%', positive: true  },
  { icon: '👥', label: 'Active Users',     value: '3,842',    trend: '+8.1%',  positive: true  },
  { icon: '📋', label: 'Reports Ready',    value: '14',       trend: '2 new',  positive: true  },
  { icon: '⚡', label: 'System Uptime',    value: '99.98%',   trend: 'Stable', positive: true  },
]

// ─── Reports ──────────────────────────────────────────────────────────────────

export interface Report {
  id: string
  name: string
  type: ReportType
  date: string
  size: string
  status: 'Ready' | 'Processing' | 'Failed'
}

export const REPORTS: Report[] = [
  { id: 'r1', name: 'Q2 Revenue Summary',       type: 'Revenue',    date: 'Jun 10, 2024', size: '2.4 MB', status: 'Ready'      },
  { id: 'r2', name: 'User Growth Report',        type: 'Users',      date: 'Jun 9, 2024',  size: '1.1 MB', status: 'Ready'      },
  { id: 'r3', name: 'Conversion Funnel Q2',      type: 'Conversion', date: 'Jun 8, 2024',  size: '0.8 MB', status: 'Processing' },
  { id: 'r4', name: 'Churn Analysis – May',      type: 'Churn',      date: 'Jun 5, 2024',  size: '1.7 MB', status: 'Ready'      },
  { id: 'r5', name: 'Enterprise Revenue Trends', type: 'Revenue',    date: 'Jun 3, 2024',  size: '3.2 MB', status: 'Failed'     },
  { id: 'r6', name: 'Monthly Active Users',      type: 'Users',      date: 'Jun 1, 2024',  size: '0.9 MB', status: 'Ready'      },
]


