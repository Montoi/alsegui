// ─── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#2BA8A2', '#5DADE2', '#EF6C4A', '#FFD23F', '#27AE60', '#1E8C86', '#A569BD']

export function getInitials(nombre: string): string {
  const parts = nombre.trim().split(/\s+/)
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : nombre.substring(0, 2).toUpperCase()
}

export function getAvatarColor(id: string): string {
  const sum = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}

// ─── Moneda ───────────────────────────────────────────────────────────────────

export function formatMonto(amount: number): string {
  return `RD$ ${amount.toLocaleString('es-DO')}`
}

// ─── Fechas ───────────────────────────────────────────────────────────────────

export function formatFecha(date: Date): string {
  return date.toLocaleDateString('es-DO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatMes(date: Date): string {
  const str = date.toLocaleDateString('es-DO', { month: 'long', year: 'numeric' })
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/** Convierte "YYYY-MM" a "Junio 2026" */
export function formatYearMonth(yearMonth: string): string {
  const [y, m] = yearMonth.split('-')
  const date = new Date(parseInt(y), parseInt(m) - 1, 1)
  const str = date.toLocaleDateString('es-DO', { month: 'long', year: 'numeric' })
  return str.charAt(0).toUpperCase() + str.slice(1)
}
