import { useDashboard } from '../hooks/useDashboard'
import type { Inquilino, Pagos, Entregas } from '../types'
import { formatMonto, formatMes, formatYearMonth, formatFecha } from '../utils/format'

// ─── Props ────────────────────────────────────────────────────────────────────

interface DashboardProps {
  inquilinos: Inquilino[]
  pagos: Pagos
  entregas: Entregas
  registrarPago: (inquilinoId: string, yearMonth: string, pagado: boolean) => void
  marcarEntrega: (duenoKey: string, yearMonth: string, entregado: boolean) => void
  mesesFijados?: string[]
}

import { FilaPago } from '../components/FilaPago'

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard({ inquilinos, pagos, entregas, registrarPago, marcarEntrega, mesesFijados = [] }: DashboardProps) {
  const { today, mesKey, tablasMensuales, kpis, liquidacionDueños } =
    useDashboard(inquilinos, pagos, entregas)

  const mesLabel = formatMes(today)
  const tablaActual = tablasMensuales.find(t => t.mesKey === mesKey)
  const pagadosCount = tablaActual ? tablaActual.inquilinos.filter(i => i.estadoPago === 'Pagado').length : 0

  const tablasRenderizar = tablasMensuales.filter(t => t.mesKey === mesKey || mesesFijados.includes(t.mesKey))


  // ── KPI Card data ──────────────────────────────────────────────────────────

  const kpiItems = [
    {
      id: 'total',
      label: 'PROPIEDADES ADMINISTRADAS',
      value: String(kpis.totalPropiedades),
      icon: '🏘️',
      iconBg: 'rgba(43,168,162,0.12)',
      iconColor: 'var(--primary)',
      badge: `${inquilinos.length} activas`,
      badgeCls: 'badge-pos',
    },
    {
      id: 'brutos',
      label: 'INGRESOS BRUTOS RECAUDADOS',
      value: formatMonto(kpis.ingresosBrutos),
      icon: '💰',
      iconBg: 'rgba(255,210,63,0.15)',
      iconColor: '#C49A00',
      badge: `${pagadosCount} pagados`,
      badgeCls: 'badge-pos',
    },
    {
      id: 'ganancias',
      label: 'MIS GANANCIAS (COMISIÓN)',
      value: formatMonto(kpis.ganancias),
      icon: '📈',
      iconBg: 'rgba(39,174,96,0.12)',
      iconColor: 'var(--success)',
      badge: 'Comisiones',
      badgeCls: 'badge-pos',
    },
    {
      id: 'neto',
      label: 'NETO A ENTREGAR A DUEÑOS',
      value: formatMonto(kpis.totalNetoEntregarDueños),
      icon: '🏦',
      iconBg: 'rgba(93,173,226,0.12)',
      iconColor: 'var(--sky)',
      badge: 'Por transferir',
      badgeCls: 'badge-pos',
    },
    {
      id: 'morosidad',
      label: 'TASA DE MOROSIDAD',
      value: `${kpis.tasaMorosidad}%`,
      icon: '⚠️',
      iconBg:
        kpis.cantidadAtrasados > 0
          ? 'rgba(239,108,74,0.12)'
          : 'rgba(39,174,96,0.12)',
      iconColor:
        kpis.cantidadAtrasados > 0 ? 'var(--coral)' : 'var(--success)',
      badge: `${kpis.cantidadAtrasados} atrasado${kpis.cantidadAtrasados !== 1 ? 's' : ''}`,
      badgeCls: kpis.cantidadAtrasados > 0 ? 'badge-neg' : 'badge-pos',
    },
  ]

  return (
    <>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <p className="page-super">{mesLabel}</p>
          <h1 className="page-title">Dashboard</h1>
        </div>
        <div className="dash-date-tag">
          📅 {formatFecha(today)}
        </div>
      </div>

      {/* ── KPI Grid (5 columnas) ── */}
      <div className="kpi-grid five-cols">
        {kpiItems.map(k => (
          <div key={k.id} className="kpi-card" id={`kpi-${k.id}`}>
            <div className="kpi-top">
              <div className="kpi-icon" style={{ background: k.iconBg, color: k.iconColor }}>
                {k.icon}
              </div>
              <span className={`badge ${k.badgeCls}`}>{k.badge}</span>
            </div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
          </div>
        ))}
      </div>

      {/* ── Tablas de Pagos por Mes ── */}
      {inquilinos.length === 0 ? (
        <div className="activity-card">
          <div className="empty-state">
            <span>🏠</span>
            <p>
              No hay inquilinos registrados.
              <br />
              Agrega uno desde el módulo de Administración.
            </p>
          </div>
        </div>
      ) : tablasRenderizar.length > 0 ? (
        tablasRenderizar.map(tabla => (
          <div key={tabla.mesKey} className="activity-card" style={{ marginBottom: '2rem' }}>
            <div className="activity-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <h3 className="chart-title">
                    {tabla.mesKey === mesKey ? '📋 Próximos Pagos' : '📌 Mes Fijado'} — {tabla.mesLabel}
                  </h3>
                </div>
                <p className="chart-sub">
                  {tabla.mesKey === mesKey 
                    ? "Mes actual. Ordenado por prioridad: Atrasados → Gracia → Pendientes → Pagados" 
                    : "Mostrado temporalmente desde Administración."}
                </p>
              </div>
              <div className="dash-legend">
                <span className="status-badge estado-atrasado"><span className="status-dot" />Atrasado</span>
                <span className="status-badge estado-gracia"><span className="status-dot" />En Gracia</span>
                <span className="status-badge estado-pendiente"><span className="status-dot" />Pendiente</span>
                <span className="status-badge estado-pagado"><span className="status-dot" />Pagado</span>
              </div>
            </div>

            <table className="activity-table">
              <thead>
                <tr>
                  <th>Inquilino</th>
                  <th>Monto</th>
                  <th>Día de Pago</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {tabla.inquilinos.map(inq => (
                  <FilaPago
                    key={inq.id}
                    inq={inq}
                    mesKey={tabla.mesKey}
                    onPago={registrarPago}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ))
      ) : null}

      {/* ── Liquidación a Dueños ── */}
      {liquidacionDueños.length > 0 && (
        <div className="activity-card">
          <div className="activity-header">
            <div>
              <h3 className="chart-title">🏦 Liquidación a Dueños</h3>
              <p className="chart-sub">
                Dinero cobrado de inquilinos · Agrupado por mes y dueño
              </p>
            </div>
          </div>

          <div className="liq-grid">
            {liquidacionDueños.map((liq, i) => (
              <div key={i} className="liq-dueno-card" id={`liq-${i}`}>

                {/* ── Cabecera del dueño ── */}
                <div className="liq-dueno-header">
                  <div>
                    <div className="liq-dueno-name">{liq.dueño}</div>
                    <div className="liq-dueno-meta">
                      Día de entrega: {liq.diaEntregaDueño} de cada mes
                      {liq.meses.length > 1 && (
                        <span className="liq-badge-meses">
                          {liq.meses.length} meses acumulados
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="liq-totales">
                    {liq.totalListo > 0 && (
                      <div className="liq-total-listo">
                        <span className="liq-total-label">✅ Pagar ahora al dueño</span>
                        <span className="liq-total-monto">
                          {formatMonto(liq.totalListo)}
                          {liq.montoMensualEsperado > liq.totalListo && (
                            <span className="liq-total-de-total"> / {formatMonto(liq.montoMensualEsperado)} del mes</span>
                          )}
                        </span>
                      </div>
                    )}
                    {liq.totalPendiente > 0 && (
                      <div className="liq-total-pendiente">
                        <span className="liq-total-label">📅 Pagar al dueño el día {liq.diaEntregaDueño}</span>
                        <span className="liq-total-monto">
                          {formatMonto(liq.totalPendiente)}
                          {liq.montoMensualEsperado > liq.totalPendiente && (
                            <span className="liq-total-de-total"> / {formatMonto(liq.montoMensualEsperado)} del mes</span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Desglose por mes ── */}
                <table className="liq-mes-table">
                  <thead>
                    <tr>
                      <th>Mes cobrado</th>
                      <th>Propiedades</th>
                      <th>Bruto</th>
                      <th>Comisión</th>
                      <th>Neto a entregar</th>
                      <th>Cuándo pagar al dueño</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {liq.meses.map((mes) => (
                      <tr key={mes.yearMonth} className={mes.entregado ? 'row-pagado' : (mes.listo ? 'liq-row-listo' : 'liq-row-pendiente')} style={mes.entregado ? { opacity: 0.7 } : {}}>
                        <td className="liq-mes-label">{formatYearMonth(mes.yearMonth)}</td>
                        <td className="liq-props">{mes.propiedades.join(' · ')}</td>
                        <td className="plan-cell">{formatMonto(mes.montoBruto)}</td>
                        <td className="plan-cell liq-comision">− {formatMonto(mes.comisionTotal)}</td>
                        <td className="plan-cell liq-neto">{formatMonto(mes.montoNeto)}</td>
                        <td>
                          {mes.entregado ? (
                            <span className="status-badge estado-pagado">
                              <span className="status-dot" />
                              Entregado
                            </span>
                          ) : mes.listo ? (
                            <span className="status-badge status-success">
                              <span className="status-dot" />
                              Pagar ahora
                            </span>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span className="status-badge estado-pendiente" style={{ width: 'fit-content' }}>
                                <span className="status-dot" />
                                El {mes.fechaEntrega.toLocaleDateString('es-DO', { day: 'numeric', month: 'short' })}
                              </span>
                              {mes.propiedadesFaltantes.length > 0 && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--coral)' }}>
                                  ⚠️ Faltan: {mes.propiedadesFaltantes.join(', ')}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="liq-accion-cell">
                          {mes.entregado ? (
                            <button
                              className="btn-desmarcar"
                              title="Deshacer pago al dueño"
                              onClick={() => marcarEntrega(liq.dueño, mes.yearMonth, false)}
                            >
                              Deshacer
                            </button>
                          ) : mes.listo && (
                            <button
                              className="btn-entregado"
                              title="Marcar como pagado al dueño"
                              onClick={() => marcarEntrega(liq.dueño, mes.yearMonth, true)}
                            >
                              ✓ Ya pagué al dueño
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
