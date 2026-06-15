// ─── Routing ──────────────────────────────────────────────────────────────────

export type Page = 'dashboard' | 'administracion' | 'home' | 'analytics' | 'reports' | 'settings' | 'finanzas'

// ─── Entidades de Dominio ─────────────────────────────────────────────────────

export interface Inquilino {
  id: string
  nombre: string
  /** Descripción completa: Ej. "Edificio Las Palmas / Apto 2A" */
  propiedadAsignada: string
  /** Nombre del dueño para agrupar en la liquidación */
  nombreDueño?: string
  montoAlquiler: number
  /** Porcentaje de comisión. Ej: 10 = 10% */
  comisionPorcentaje: number
  /** Día del mes en que el inquilino debe pagar. Ej: 1 */
  diaPagoMes: number
  /** Día del mes en que debes transferirle al dueño. Ej: 10 */
  diaEntregaDueño: number
  /** Último mes pagado en formato YYYY-MM */
  ultimoMesPagado?: string
}

// ─── Estados de Pago ──────────────────────────────────────────────────────────

export type EstadoPago = 'Pagado' | 'Pendiente' | 'PeriodoDeGracia' | 'Atrasado'

export interface InquilinoConEstado extends Inquilino {
  estadoPago: EstadoPago
  /**
   * Días entre la fecha límite y hoy.
   * Positivo → faltan X días.
   * Negativo → lleva X días vencido.
   */
  diasDiferencia: number
  /** Texto legible para mostrar en UI */
  etiquetaEstado: string
  haPagado: boolean
}

// ─── KPIs del Mes ─────────────────────────────────────────────────────────────

export interface KPIs {
  totalPropiedades: number
  ingresosBrutos: number
  ganancias: number
  totalNetoEntregarDueños: number
  /** Porcentaje de inquilinos en estado Atrasado */
  tasaMorosidad: number
  cantidadAtrasados: number
}

// ─── Liquidación a Dueños ────────────────────────────────────────────────────

export interface LiquidacionDueño {
  dueño: string
  propiedades: string[]
  montoBruto: number
  comisionTotal: number
  montoNeto: number
  diaEntregaDueño: number
  /** true si today.getDate() >= diaEntregaDueño */
  listo: boolean
}

// ─── Registro de Pagos ───────────────────────────────────────────────────────
// Formato: { "2026-06": { "inq-1": true, "inq-2": false } }

export type Pagos = Record<string, Record<string, boolean>>
