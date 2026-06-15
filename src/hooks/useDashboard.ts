import { useMemo } from 'react'
import type {
  Inquilino,
  InquilinoConEstado,
  EstadoPago,
  KPIs,
  LiquidacionDueño,
  Pagos,
} from '../types'

// ─── Utilidades de Fecha ──────────────────────────────────────────────────────

/** Devuelve la clave "YYYY-MM" del mes de una fecha dada */
export function getMesKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/** Diferencia en días enteros entre dos fechas (sin horas) */
function diffDias(a: Date, b: Date): number {
  const ms = a.getTime() - b.getTime()
  return Math.round(ms / 86_400_000)
}

// ─── Cálculo de Estado por Inquilino ─────────────────────────────────────────

function calcularEstado(
  inq: Inquilino,
  haPagado: boolean,
  fechaLimite: Date,
  today: Date
): InquilinoConEstado {
  if (haPagado) {
    return {
      ...inq,
      estadoPago: 'Pagado',
      diasDiferencia: 0,
      etiquetaEstado: 'Pagado',
      haPagado: true,
    }
  }

  // today normalizado a medianoche para comparación exacta en días
  const todayNorm = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const diasDiferencia = diffDias(fechaLimite, todayNorm)

  let estadoPago: EstadoPago
  let etiquetaEstado: string

  if (diasDiferencia >= 0) {
    estadoPago = 'Pendiente'
    etiquetaEstado =
      diasDiferencia === 0
        ? 'Vence hoy'
        : `Faltan ${diasDiferencia} día${diasDiferencia !== 1 ? 's' : ''}`
  } else {
    const diasAtraso = Math.abs(diasDiferencia)

    if (diasAtraso <= 5) {
      estadoPago = 'PeriodoDeGracia'
      etiquetaEstado = `En gracia: ${diasAtraso} día${diasAtraso !== 1 ? 's' : ''} transcurrido${diasAtraso !== 1 ? 's' : ''}`
    } else {
      estadoPago = 'Atrasado'
      const diasOficial = diasAtraso - 5 // restamos los 5 días de gracia
      etiquetaEstado = `Atrasado por ${diasOficial} día${diasOficial !== 1 ? 's' : ''}`
    }
  }

  return { ...inq, estadoPago, diasDiferencia, etiquetaEstado, haPagado: false }
}

// ─── Tabla de Prioridad para Ordenamiento ────────────────────────────────────

const PRIORIDAD: Record<EstadoPago, number> = {
  Atrasado:       0,
  PeriodoDeGracia: 1,
  Pendiente:      2,
  Pagado:         3,
}

// ─── Hook Principal ───────────────────────────────────────────────────────────

/**
 * Hook de Dashboard.
 * Consume los datos de `useAdministracion` y devuelve todos los valores
 * calculados: estados de pago, KPIs y liquidación a dueños.
 *
 * Es un hook de sólo lectura — no modifica estado directamente.
 */
export function useDashboard(inquilinos: Inquilino[], pagos: Pagos) {
  const today = new Date()
  const mesKey = getMesKey(today)

  // ── 1. Estado individual de cada inquilino ───────────────────────────────

  // Pagos del mes actual — memoizado para estabilidad de referencia
  const pagosMes = useMemo<Record<string, boolean>>(
    () => pagos[mesKey] ?? {},
    [pagos, mesKey]
  )

  // ── 1. Estado individual de cada inquilino ───────────────────────────────

  const inquilinosConEstado = useMemo<InquilinoConEstado[]>(
    () =>
      inquilinos.map(inq =>
        calcularEstado(inq, pagosMes[inq.id] ?? false, new Date())
      ),
    [inquilinos, pagosMes]
  )

  // ── 2. Ordenamiento por prioridad de cobranza ───────────────────────────
  //   1° Atrasados (más días vencidos primero)
  //   2° En Período de Gracia
  //   3° Pendientes (más cercano a vencer primero)
  //   4° Pagados al final

  const inquilinosOrdenados = useMemo<InquilinoConEstado[]>(
    () =>
      [...inquilinosConEstado].sort((a, b) => {
        const pDiff = PRIORIDAD[a.estadoPago] - PRIORIDAD[b.estadoPago]
        if (pDiff !== 0) return pDiff
        // Dentro del mismo grupo: diasDiferencia ascendente
        // • Atrasados: más negativo primero → mayor atraso primero ✓
        // • Pendientes: menor positivo primero → más cercano primero ✓
        return a.diasDiferencia - b.diasDiferencia
      }),
    [inquilinosConEstado]
  )

  // ── 3. KPIs Globales del Mes ────────────────────────────────────────────

  const kpis = useMemo<KPIs>(() => {
    const pagados  = inquilinosConEstado.filter(i => i.estadoPago === 'Pagado')
    const atrasados = inquilinosConEstado.filter(i => i.estadoPago === 'Atrasado')

    const ingresosBrutos = pagados.reduce((s, i) => s + i.montoAlquiler, 0)
    const ganancias      = pagados.reduce(
      (s, i) => s + i.montoAlquiler * (i.comisionPorcentaje / 100),
      0
    )

    return {
      totalPropiedades: inquilinos.length,
      ingresosBrutos,
      ganancias,
      totalNetoEntregarDueños: ingresosBrutos - ganancias,
      cantidadAtrasados: atrasados.length,
      tasaMorosidad:
        inquilinos.length > 0
          ? Math.round((atrasados.length / inquilinos.length) * 100)
          : 0,
    }
  }, [inquilinosConEstado, inquilinos.length])

  // ── 4. Liquidación a Dueños ─────────────────────────────────────────────
  // Sólo inquilinos que ya pagaron, agrupados por dueño/propiedad.

  const liquidacionDueños = useMemo<LiquidacionDueño[]>(() => {
    const pagados = inquilinosConEstado.filter(i => i.estadoPago === 'Pagado')
    const grupos: Record<string, LiquidacionDueño> = {}
    const hoy = new Date()

    for (const inq of pagados) {
      const key = inq.nombreDueño ?? inq.propiedadAsignada

      if (!grupos[key]) {
        grupos[key] = {
          dueño: key,
          propiedades: [],
          montoBruto: 0,
          comisionTotal: 0,
          montoNeto: 0,
          diaEntregaDueño: inq.diaEntregaDueño,
          listo: hoy.getDate() >= inq.diaEntregaDueño,
        }
      }

      const comision = inq.montoAlquiler * (inq.comisionPorcentaje / 100)
      grupos[key].propiedades.push(inq.propiedadAsignada)
      grupos[key].montoBruto    += inq.montoAlquiler
      grupos[key].comisionTotal += comision
      grupos[key].montoNeto     += inq.montoAlquiler - comision
    }

    // Ordenar por día de entrega ascendente (el más próximo primero)
    return Object.values(grupos).sort((a, b) => a.diaEntregaDueño - b.diaEntregaDueño)
  }, [inquilinosConEstado])

  return {
    today,
    mesKey,
    inquilinosConEstado,
    inquilinosOrdenados,
    kpis,
    liquidacionDueños,
  }
}
