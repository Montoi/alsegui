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

  const inquilinosConEstado = useMemo<InquilinoConEstado[]>(
    () =>
      inquilinos.map(inq => {
        let year = today.getFullYear()
        let month = today.getMonth()
        let haPagado = false

        // ── Determinar el mes de arranque para buscar el primer impago ───────
        // 1° Si el inquilino tiene registros propios → su mes más antiguo
        // 2° Si no tiene registros → mes más antiguo del sistema (así los que
        //    nunca pagaron junio quedan como atrasados, no como "nuevo en julio")
        // 3° Fallback final → mes actual

        const mesesPropios = Object.keys(pagos)
          .filter(mes => pagos[mes]?.[inq.id] !== undefined)
          .sort()

        let checkYear: number
        let checkMonth: number // 0-indexed

        if (mesesPropios.length > 0) {
          // Arrancar desde el mes más antiguo con registro propio
          const [yStr, mStr] = mesesPropios[0].split('-')
          checkYear  = parseInt(yStr, 10)
          checkMonth = parseInt(mStr, 10) - 1
        } else if (primerMesGlobal) {
          // Sin registros propios pero el sistema ya tiene historial →
          // arrancar desde el primer mes del sistema para detectar meses impagos
          const [yStr, mStr] = primerMesGlobal.split('-')
          checkYear  = parseInt(yStr, 10)
          checkMonth = parseInt(mStr, 10) - 1
        } else if (inq.ultimoMesPagado) {
          // Fallback: usar ultimoMesPagado si existe
          const [yStr, mStr] = inq.ultimoMesPagado.split('-')
          checkYear  = parseInt(yStr, 10)
          checkMonth = parseInt(mStr, 10)
          if (checkMonth > 11) { checkMonth = 0; checkYear++ }
        } else {
          // Sin ningún historial en absoluto: evaluar desde el mes actual
          checkYear  = today.getFullYear()
          checkMonth = today.getMonth()
        }

        // ── Avanzar mes a mes buscando el primer mes impago ──────────────────
        let foundUnpaid = false
        while (
          checkYear < today.getFullYear() ||
          (checkYear === today.getFullYear() && checkMonth <= today.getMonth())
        ) {
          const mKey = `${checkYear}-${String(checkMonth + 1).padStart(2, '0')}`
          if (!pagos[mKey]?.[inq.id]) {
            year  = checkYear
            month = checkMonth
            foundUnpaid = true
            break
          }
          checkMonth++
          if (checkMonth > 11) { checkMonth = 0; checkYear++ }
        }

        // Si no encontramos ningún mes impago → pagó todo hasta el mes actual
        if (!foundUnpaid) {
          haPagado = true
          year  = today.getFullYear()
          month = today.getMonth()
        }

        const fechaLimite = new Date(year, month, inq.diaPagoMes)
        return calcularEstado(inq, haPagado, fechaLimite, today)
      }),
    [inquilinos, pagos, today, primerMesGlobal]
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

  // ── 4. Liquidación a Dueños ──────────────────────────────────────────────
  // Agrupa TODOS los pagos históricos (cualquier mes) por dueño.
  // Cada dueño tiene un desglose de meses para mostrar
  // pagos acumulados de meses distintos pendientes de entregar.

  const liquidacionDueños = useMemo<LiquidacionDueño[]>(() => {
    // Mapa de inquilino.id → inquilino (para lookup rápido)
    const inqMap = Object.fromEntries(inquilinos.map(i => [i.id, i]))
    const hoy = new Date()

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
        // Ej: junio con día 25 → entregaDate = 25-jun-2026
        //     Si hoy es 2-jul-2026 → 25-jun < hoy → listo = true ✅
        //     Si hoy es 2-jul-2026 y mes=julio → entregaDate = 25-jul-2026 → listo = false ⏳
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
        } satisfies LiquidacionDueño
      })
      .filter((x): x is LiquidacionDueño => x !== null)
      .sort((a, b) => a.diaEntregaDueño - b.diaEntregaDueño)
  }, [inquilinos, pagos, entregas])

  return {
    today,
    mesKey,
    inquilinosConEstado,
    inquilinosOrdenados,
    kpis,
    liquidacionDueños,
  }
}
