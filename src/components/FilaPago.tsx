import type { InquilinoConEstado, EstadoPago } from '../types'
import { getInitials, getAvatarColor, formatMonto } from '../utils/format'

export function getEstadoClass(estado: EstadoPago): string {
  switch (estado) {
    case 'Pagado':         return 'estado-pagado'
    case 'Pendiente':      return 'estado-pendiente'
    case 'PeriodoDeGracia': return 'estado-gracia'
    case 'Atrasado':       return 'estado-atrasado'
  }
}

export interface FilaPagoProps {
  inq: InquilinoConEstado
  mesKey: string
  onPago: (id: string, mes: string, pagado: boolean) => void
}

export function FilaPago({ inq, mesKey, onPago }: FilaPagoProps) {
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
