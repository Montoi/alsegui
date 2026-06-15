import { useMemo } from 'react'
import type { Inquilino, Pagos } from '../types'
import { getMesKey } from '../hooks/useDashboard'
import { formatMonto, formatMes, formatFecha } from '../utils/format'
interface FinanzasProps {
  inquilinos: Inquilino[]
  pagos: Pagos
}

interface ResumenDueño {
  dueño: string
  propiedadesTotales: number
  propiedadesPagadas: number
  montoTotalEsperado: number
  montoTotalRecaudado: number
  comisionTotal: number
  netoAEntregar: number
}

export default function Finanzas({ inquilinos, pagos }: FinanzasProps) {
  const today = new Date()
  const mesKey = getMesKey(today)
  const mesLabel = formatMes(today)

  const { liquidaciones, globales } = useMemo(() => {
    const pagosMes = pagos[mesKey] || {}
    const grupos: Record<string, ResumenDueño> = {}

    for (const inq of inquilinos) {
      const dueño = inq.nombreDueño?.trim() || inq.propiedadAsignada

      if (!grupos[dueño]) {
        grupos[dueño] = {
          dueño,
          propiedadesTotales: 0,
          propiedadesPagadas: 0,
          montoTotalEsperado: 0,
          montoTotalRecaudado: 0,
          comisionTotal: 0,
          netoAEntregar: 0,
        }
      }

      grupos[dueño].propiedadesTotales += 1
      grupos[dueño].montoTotalEsperado += inq.montoAlquiler

      const haPagado = !!pagosMes[inq.id]
      if (haPagado) {
        grupos[dueño].propiedadesPagadas += 1
        grupos[dueño].montoTotalRecaudado += inq.montoAlquiler
        const comision = inq.montoAlquiler * (inq.comisionPorcentaje / 100)
        grupos[dueño].comisionTotal += comision
        grupos[dueño].netoAEntregar += inq.montoAlquiler - comision
      }
    }

    const arr = Object.values(grupos).sort((a, b) => b.montoTotalRecaudado - a.montoTotalRecaudado)

    const globales = arr.reduce(
      (acc, g) => ({
        esperado: acc.esperado + g.montoTotalEsperado,
        recaudado: acc.recaudado + g.montoTotalRecaudado,
        comision: acc.comision + g.comisionTotal,
        neto: acc.neto + g.netoAEntregar,
      }),
      { esperado: 0, recaudado: 0, comision: 0, neto: 0 }
    )

    return { liquidaciones: arr, globales }
  }, [inquilinos, pagos, mesKey])

  return (
    <>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <p className="page-super">{mesLabel}</p>
          <h1 className="page-title">Módulo Financiero</h1>
        </div>
        <div className="dash-date-tag">
          📅 {formatFecha(today)}
        </div>
      </div>

      {/* ── KPIs Globales ── */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon" style={{ background: 'rgba(255,210,63,0.15)', color: '#C49A00' }}>💰</div>
            <span className="badge badge-pos">Global</span>
          </div>
          <div className="kpi-label">RECAUDADO ESTE MES</div>
          <div className="kpi-value">{formatMonto(globales.recaudado)} <span style={{fontSize: '0.5em', color: '#6A9090'}}>de {formatMonto(globales.esperado)}</span></div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon" style={{ background: 'rgba(39,174,96,0.12)', color: 'var(--success)' }}>📈</div>
            <span className="badge badge-pos">Global</span>
          </div>
          <div className="kpi-label">TOTAL COMISIONES (MIS GANANCIAS)</div>
          <div className="kpi-value">{formatMonto(globales.comision)}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon" style={{ background: 'rgba(93,173,226,0.12)', color: 'var(--sky)' }}>🏦</div>
            <span className="badge badge-pos">Global</span>
          </div>
          <div className="kpi-label">NETO A ENTREGAR (A DUEÑOS)</div>
          <div className="kpi-value">{formatMonto(globales.neto)}</div>
        </div>
      </div>

      {/* ── Desglose por Dueño ── */}
      <h2 className="home-section-title" style={{ marginTop: '2rem' }}>Resumen por Dueño</h2>
      <div className="activity-card">
        <table className="activity-table">
          <thead>
            <tr>
              <th>Dueño</th>
              <th>Propiedades (Pagadas / Totales)</th>
              <th>Recaudado / Esperado</th>
              <th>Comisión Retenida</th>
              <th>Neto a Entregar</th>
              <th>Progreso</th>
            </tr>
          </thead>
          <tbody>
            {liquidaciones.map(liq => {
              const pct = liq.montoTotalEsperado > 0 
                ? Math.round((liq.montoTotalRecaudado / liq.montoTotalEsperado) * 100) 
                : 0
              const progressColor = pct === 100 ? 'var(--success)' : pct > 0 ? 'var(--primary)' : 'var(--border)'

              return (
                <tr key={liq.dueño}>
                  <td>
                    <div className="user-name">👤 {liq.dueño}</div>
                  </td>
                  <td className="plan-cell">
                    <span style={{ fontWeight: 'bold' }}>{liq.propiedadesPagadas}</span> / {liq.propiedadesTotales}
                  </td>
                  <td className="plan-cell">
                    <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{formatMonto(liq.montoTotalRecaudado)}</span>
                    <span style={{ color: 'var(--text-light)' }}> / {formatMonto(liq.montoTotalEsperado)}</span>
                  </td>
                  <td className="plan-cell" style={{ color: 'var(--success)' }}>
                    {formatMonto(liq.comisionTotal)}
                  </td>
                  <td className="plan-cell liq-neto">
                    {formatMonto(liq.netoAEntregar)}
                  </td>
                  <td style={{ minWidth: '150px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '8px', background: 'var(--bg-main)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: progressColor, transition: 'width 0.3s' }}></div>
                      </div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 'bold' }}>{pct}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
