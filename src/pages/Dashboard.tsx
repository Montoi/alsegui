import { useDashboard } from '../hooks/useDashboard'
import type { Inquilino, Pagos, InquilinoConEstado, EstadoPago } from '../types'
import { getInitials, getAvatarColor, formatMonto, formatMes, formatFecha } from '../utils/format'

// ─── Props ────────────────────────────────────────────────────────────────────

interface DashboardProps {
  inquilinos: Inquilino[]
  pagos: Pagos
  registrarPago: (inquilinoId: string, yearMonth: string, pagado: boolean) => void
}

// ─── Helpers de UI ────────────────────────────────────────────────────────────

function getEstadoClass(estado: EstadoPago): string {
  switch (estado) {
    case 'Pagado':         return 'estado-pagado'
    case 'Pendiente':      return 'estado-pendiente'
    case 'PeriodoDeGracia': return 'estado-gracia'
    case 'Atrasado':       return 'estado-atrasado'
  }
}

// ─── Sub-componente: Fila de Pago ────────────────────────────────────────────

interface FilaPagoProps {
  inq: InquilinoConEstado
  mesKey: string
  onPago: (id: string, mes: string, pagado: boolean) => void
}

function FilaPago({ inq, mesKey, onPago }: FilaPagoProps) {
  return (
    <tr id={`pago-${inq.id}`} className={inq.estadoPago === 'Pagado' ? 'row-pagado' : ''}>
      <td>
        <div className="user-cell">
          <div className="table-avatar" style={{ background: getAvatarColor(inq.id) }}>
            {getInitials(inq.nombre)}
          </div>
          <div>
            <div className="user-name">{inq.nombre}</div>
            <div className="user-email">{inq.propiedadAsignada}</div>
          </div>
        </div>
      </td>
      <td className="plan-cell">{formatMonto(inq.montoAlquiler)}</td>
      <td className="plan-cell">Día {inq.diaPagoMes}</td>
      <td>
        <span className={`status-badge ${getEstadoClass(inq.estadoPago)}`}>
          <span className="status-dot" />
          {inq.etiquetaEstado}
        </span>
      </td>
      <td>
        {inq.estadoPago === 'Pagado' ? (
          <button
            className="btn-desmarcar"
            onClick={() => onPago(inq.id, mesKey, false)}
          >
            Desmarcar
          </button>
        ) : (
          <button
            className="btn-marcar-pagado"
            onClick={() => onPago(inq.id, mesKey, true)}
          >
            ✓ Marcar Pagado
          </button>
        )}
      </td>
    </tr>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard({ inquilinos, pagos, registrarPago }: DashboardProps) {
  const { today, mesKey, inquilinosOrdenados, kpis, liquidacionDueños } =
    useDashboard(inquilinos, pagos)

  const mesLabel = formatMes(today)

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
      badge: `${inquilinosOrdenados.filter(i => i.estadoPago === 'Pagado').length} pagados`,
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

      {/* ── Tabla: Próximos Pagos ── */}
      <div className="activity-card">
        <div className="activity-header">
          <div>
            <h3 className="chart-title">📋 Próximos Pagos — {mesLabel}</h3>
            <p className="chart-sub">
              Ordenado por prioridad: Atrasados → Gracia → Pendientes → Pagados
            </p>
          </div>
          <div className="dash-legend">
            <span className="status-badge estado-atrasado"><span className="status-dot" />Atrasado</span>
            <span className="status-badge estado-gracia"><span className="status-dot" />En Gracia</span>
            <span className="status-badge estado-pendiente"><span className="status-dot" />Pendiente</span>
            <span className="status-badge estado-pagado"><span className="status-dot" />Pagado</span>
          </div>
        </div>

        {inquilinos.length === 0 ? (
          <div className="empty-state">
            <span>🏠</span>
            <p>
              No hay inquilinos registrados.
              <br />
              Agrega uno desde el módulo de Administración.
            </p>
          </div>
        ) : (
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
              {inquilinosOrdenados.map(inq => (
                <FilaPago
                  key={inq.id}
                  inq={inq}
                  mesKey={mesKey}
                  onPago={registrarPago}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Tabla: Liquidación a Dueños ── */}
      {liquidacionDueños.length > 0 && (
        <div className="activity-card">
          <div className="activity-header">
            <div>
              <h3 className="chart-title">🏦 Liquidación a Dueños</h3>
              <p className="chart-sub">
                Sólo inquilinos con estado Pagado · Ordenado por día de entrega
              </p>
            </div>
          </div>
          <table className="activity-table">
            <thead>
              <tr>
                <th>Dueño / Propiedad</th>
                <th>Monto Bruto</th>
                <th>Comisión</th>
                <th>Monto Neto</th>
                <th>Día de Entrega</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {liquidacionDueños.map((liq, i) => (
                <tr key={i} id={`liq-${i}`}>
                  <td>
                    <div className="user-name">{liq.dueño}</div>
                    <div className="user-email">{liq.propiedades.join(' · ')}</div>
                  </td>
                  <td className="plan-cell">{formatMonto(liq.montoBruto)}</td>
                  <td className="plan-cell liq-comision">− {formatMonto(liq.comisionTotal)}</td>
                  <td className="plan-cell liq-neto">{formatMonto(liq.montoNeto)}</td>
                  <td className="plan-cell">Día {liq.diaEntregaDueño}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        liq.listo ? 'status-success' : 'estado-pendiente'
                      }`}
                    >
                      <span className="status-dot" />
                      {liq.listo ? 'Listo para pagar' : 'Pendiente entrega'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
