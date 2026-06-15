// ─── Chart Dimensions ────────────────────────────────────────────────────────

export const CW = 500   // SVG width
export const CH = 155   // chart area height (labels below)
export const PX = 12    // x padding
export const PY = 12    // y padding

// ─── Line Chart ───────────────────────────────────────────────────────────────

export interface Point { x: number; y: number }

/** Convert percentage values to SVG pixel coordinates */
export function toPoints(values: number[]): Point[] {
  const n = values.length
  const xStep = (CW - 2 * PX) / (n - 1)
  return values.map((v, i) => ({
    x: PX + i * xStep,
    y: PY + (v / 100) * (CH - 2 * PY),
  }))
}

/** Smooth cubic bezier path through a series of points */
export function makePath(pts: Point[]): string {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x},${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1]
    const c = pts[i]
    const cx = (p.x + c.x) / 2
    d += ` C ${cx},${p.y} ${cx},${c.y} ${c.x},${c.y}`
  }
  return d
}

/** Closed area path under the line (for gradient fill) */
export function makeAreaPath(pts: Point[]): string {
  return `${makePath(pts)} L ${pts[pts.length - 1].x},${CH} L ${pts[0].x},${CH} Z`
}

// ─── Donut Chart ─────────────────────────────────────────────────────────────

export const DONUT_R = 68
export const DONUT_C = 2 * Math.PI * DONUT_R  // ≈ 427.26
