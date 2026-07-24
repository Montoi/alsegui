import { useMemo } from 'react'
import type {
  Inquilino,
  InquilinoConEstado,
  EstadoPago,
  KPIs,
  LiquidacionDueño,
  PagoPorMes,
  Pagos,
  Entregas,
} from '../types'
import { formatYearMonth } from '../utils/format'

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
export function useDashboard(inquilinos: Inquilino[], pagos: Pagos, entregas: Entregas) {
  const today = new Date()
  const mesKey = getMesKey(today)

  // ── 1. Estado individual de cada inquilino ───────────────────────────────

  // Mes más antiguo registrado en TODO el sistema (global, no por inquilino)
  // Se usa como punto de partida para inquilinos sin registros propios.
  const primerMesGlobal = useMemo(() => {
    const meses = Object.keys(pagos).sort()
    return meses.length > 0 ? meses[0] : null
  }, [pagos])

  // ── 1. Tablas mensuales (Historial de impagos + Mes actual) ────────────────
  const tablasMensuales = useMemo(() => {
    const startKey = primerMesGlobal || mesKey
    const endKey = mesKey

    const range: string[] = []
    let [sYear, sMonth] = startKey.split('-').map(Number)
    const [eYear, eMonth] = endKey.split('-').map(Number)

    while (sYear < eYear || (sYear === eYear && sMonth <= eMonth)) {
      range.push(`${sYear}-${String(sMonth).padStart(2, '0')}`)
      sMonth++
      if (sMonth > 12) {
        sMonth = 1
        sYear++
      }
    }

    return range.map(mKey => {
      const [yStr, mStr] = mKey.split('-')
      const targetYear = parseInt(yStr, 10)
      const targetMonth = parseInt(mStr, 10) - 1

      const inqsConEstado = inquilinos.map(inq => {
        const haPagado = !!pagos[mKey]?.[inq.id]
        const fechaLimite = new Date(targetYear, targetMonth, inq.diaPagoMes)
        return calcularEstado(inq, haPagado, fechaLimite, today)
      })

      const inqsOrdenados = [...inqsConEstado].sort((a, b) => {
        const pDiff = PRIORIDAD[a.estadoPago] - PRIORIDAD[b.estadoPago]
        if (pDiff !== 0) return pDiff
        return a.diasDiferencia - b.diasDiferencia
      })

      const esMesActual = mKey === mesKey
      const inqsFiltrados = esMesActual
        ? inqsOrdenados
        : inqsOrdenados.filter(i => !i.haPagado)

      return {
        mesKey: mKey,
        mesLabel: formatYearMonth(mKey),
        inquilinos: inqsFiltrados,
      }
    })
  }, [inquilinos, pagos, primerMesGlobal, mesKey, today])

  // ── 2. KPIs Globales del Mes Actual y Morosidad Histórica ────────────────
  const kpis = useMemo<KPIs>(() => {
    // Para ingresos y ganancias: evaluar sólo el mes actual
    const inquilinosMesActual = inquilinos.map(inq => {
      const haPagado = !!pagos[mesKey]?.[inq.id]
      const [yStr, mStr] = mesKey.split('-')
      const targetYear = parseInt(yStr, 10)
      const targetMonth = parseInt(mStr, 10) - 1
      const fechaLimite = new Date(targetYear, targetMonth, inq.diaPagoMes)
      return calcularEstado(inq, haPagado, fechaLimite, today)
    })

    const pagadosMesActual = inquilinosMesActual.filter(i => i.estadoPago === 'Pagado')
    const ingresosBrutos = pagadosMesActual.reduce((s, i) => s + i.montoAlquiler, 0)
    const ganancias = pagadosMesActual.reduce(
      (s, i) => s + i.montoAlquiler * (i.comisionPorcentaje / 100),
      0
    )

    // Para morosidad: un inquilino está Atrasado si tiene estado 'Atrasado' en CUALQUIER tabla mensual activa
    const inqsAtrasadosUnicos = new Set<string>()
    for (const tabla of tablasMensuales) {
      for (const inq of tabla.inquilinos) {
        if (inq.estadoPago === 'Atrasado') {
          inqsAtrasadosUnicos.add(inq.id)
        }
      }
    }

    return {
      totalPropiedades: inquilinos.length,
      ingresosBrutos,
      ganancias,
      totalNetoEntregarDueños: ingresosBrutos - ganancias,
      cantidadAtrasados: inqsAtrasadosUnicos.size,
      tasaMorosidad:
        inquilinos.length > 0
          ? Math.round((inqsAtrasadosUnicos.size / inquilinos.length) * 100)
          : 0,
    }
  }, [inquilinos, pagos, mesKey, today, tablasMensuales])

  // ── 3. Liquidación a Dueños ──────────────────────────────────────────────
  // Agrupa TODOS los pagos históricos (cualquier mes) por dueño.
  // Cada dueño tiene un desglose de meses para mostrar
  // pagos acumulados de meses distintos pendientes de entregar.

  const liquidacionDueños = useMemo<LiquidacionDueño[]>(() => {
    // Mapa de inquilino.id → inquilino (para lookup rápido)
    const inqMap = Object.fromEntries(inquilinos.map(i => [i.id, i]))
    const hoy = new Date()

    // Monto mensual esperado por dueño: suma neta si TODOS sus inquilinos pagaran
    const esperadoPorDueño: Record<string, number> = {}
    for (const inq of inquilinos) {
      const keyDueño = inq.nombreDueño ?? inq.propiedadAsignada
      const neto = inq.montoAlquiler * (1 - inq.comisionPorcentaje / 100)
      esperadoPorDueño[keyDueño] = (esperadoPorDueño[keyDueño] ?? 0) + neto
    }

    // grupos[dueño][yearMonth] = PagoPorMes
    const grupos: Record<string, {
      diaEntregaDueño: number
      meses: Record<string, PagoPorMes>
    }> = {}

    // Recorrer todos los meses en pagos
    for (const yearMonth of Object.keys(pagos)) {
      const pagosMes = pagos[yearMonth]

      for (const [inquilinoId, pagado] of Object.entries(pagosMes)) {
        if (!pagado) continue // solo pagos marcados como true

        const inq = inqMap[inquilinoId]
        if (!inq) continue

        const keyDueño = inq.nombreDueño ?? inq.propiedadAsignada

        // Inicializar grupo del dueño si no existe
        if (!grupos[keyDueño]) {
          grupos[keyDueño] = {
            diaEntregaDueño: inq.diaEntregaDueño,
            meses: {},
          }
        }

        // "Listo" = la fecha de entrega DE ESE MES ya pasó (o es hoy)
        const [yStr, mStr] = yearMonth.split('-')
        const mesAno = parseInt(yStr, 10)
        const mesNum = parseInt(mStr, 10) - 1 // 0-indexed
        const fechaEntrega = new Date(mesAno, mesNum, inq.diaEntregaDueño)
        const listo = hoy >= fechaEntrega

        // Inicializar entrada de ese mes si no existe
        if (!grupos[keyDueño].meses[yearMonth]) {
          grupos[keyDueño].meses[yearMonth] = {
            yearMonth,
            propiedades: [],
            montoBruto:    0,
            comisionTotal: 0,
            montoNeto:     0,
            fechaEntrega,
            listo,
          }
        }

        const comision = inq.montoAlquiler * (inq.comisionPorcentaje / 100)
        const entrada  = grupos[keyDueño].meses[yearMonth]
        entrada.propiedades.push(inq.propiedadAsignada)
        entrada.montoBruto    += inq.montoAlquiler
        entrada.comisionTotal += comision
        entrada.montoNeto     += inq.montoAlquiler - comision
      }
    }

    // Convertir a array, filtrar meses ya entregados y calcular totales
    return Object.entries(grupos)
      .map(([dueño, { diaEntregaDueño, meses }]) => {
        // Excluir meses que ya fueron marcados como entregados al dueño
        const entregadosMes = new Set(entregas[dueño] ?? [])
        const mesesOrdenados = Object.values(meses)
          .filter(m => !entregadosMes.has(m.yearMonth))
          .sort((a, b) => a.yearMonth.localeCompare(b.yearMonth))

        if (mesesOrdenados.length === 0) return null // ocultar si no quedan meses

        const totalListo     = mesesOrdenados.filter(m => m.listo).reduce((s, m) => s + m.montoNeto, 0)
        const totalPendiente = mesesOrdenados.filter(m => !m.listo).reduce((s, m) => s + m.montoNeto, 0)
        return {
          dueño,
          diaEntregaDueño,
          meses: mesesOrdenados,
          totalListo,
          totalPendiente,
          totalNeto: totalListo + totalPendiente,
          montoMensualEsperado: esperadoPorDueño[dueño] ?? 0,
        } satisfies LiquidacionDueño
      })
      .filter((x): x is LiquidacionDueño => x !== null)
      .sort((a, b) => a.diaEntregaDueño - b.diaEntregaDueño)
  }, [inquilinos, pagos, entregas])

  return {
    today,
    mesKey,
    tablasMensuales,
    kpis,
    liquidacionDueños,
  }
}
