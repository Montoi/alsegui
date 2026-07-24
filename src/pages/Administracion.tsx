import { useState, useMemo } from 'react'
import type { Inquilino, Pagos, Entregas } from '../types'
import { useDashboard } from '../hooks/useDashboard'
import { FilaPago } from '../components/FilaPago'
import { getInitials, getAvatarColor, formatMonto, formatFecha } from '../utils/format'

// ─── Props ────────────────────────────────────────────────────────────────────

interface AdministracionProps {
  inquilinos: Inquilino[]
  pagos: Pagos
  entregas: Entregas
  registrarPago: (inquilinoId: string, yearMonth: string, pagado: boolean) => void
  mesesFijados: string[]
  toggleMesFijado: (mes: string) => void
  onAgregar: (data: Omit<Inquilino, 'id'>) => void
  onEditar: (id: string, data: Partial<Omit<Inquilino, 'id'>>) => void
  onEliminar: (id: string) => void
}

// ─── Formulario ───────────────────────────────────────────────────────────────

type FormData = Omit<Inquilino, 'id'>
type FormErrores = Partial<Record<keyof FormData, string>>

const FORM_VACIO: FormData = {
  nombre: '',
  propiedadAsignada: '',
  nombreDueño: '',
  montoAlquiler: 0,
  comisionPorcentaje: 10,
  diaPagoMes: 1,
  diaEntregaDueño: 10,
}

interface FormularioProps {
  inicial: FormData
  modo: 'agregar' | 'editar'
  onSubmit: (data: FormData) => void
  onCancelar: () => void
}

function FormularioInquilino({ inicial, modo, onSubmit, onCancelar }: FormularioProps) {
  const [form, setForm] = useState<FormData>(inicial)
  const [errores, setErrores] = useState<FormErrores>({})

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrores(prev => ({ ...prev, [key]: undefined }))
  }

  function validar(): boolean {
    const e: FormErrores = {}
    if (!form.nombre.trim())            e.nombre = 'El nombre es requerido.'
    if (!form.propiedadAsignada.trim()) e.propiedadAsignada = 'La propiedad es requerida.'
    if (form.montoAlquiler <= 0)        e.montoAlquiler = 'El monto debe ser mayor a 0.'
    if (form.comisionPorcentaje < 0 || form.comisionPorcentaje > 100)
      e.comisionPorcentaje = 'La comisión debe estar entre 0 y 100.'
    if (form.diaPagoMes < 1 || form.diaPagoMes > 31)
      e.diaPagoMes = 'El día debe estar entre 1 y 31.'
    if (form.diaEntregaDueño < 1 || form.diaEntregaDueño > 31)
      e.diaEntregaDueño = 'El día debe estar entre 1 y 31.'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (validar()) onSubmit(form)
  }

  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onCancelar() }}
    >
      <div className="modal-box">
        <div className="modal-header">
          <h2 className="modal-title">
            {modo === 'agregar' ? '➕ Nuevo Inquilino' : '✏️ Editar Inquilino'}
          </h2>
          <button id="modal-close" className="modal-close" onClick={onCancelar}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-grid">

            {/* Nombre */}
            <div className="settings-field">
              <label htmlFor="f-nombre">Nombre completo *</label>
              <input
                id="f-nombre"
                type="text"
                value={form.nombre}
                onChange={e => set('nombre', e.target.value)}
                placeholder="Ej: María González"
              />
              {errores.nombre && <span className="field-error">{errores.nombre}</span>}
            </div>

            {/* Dueño */}
            <div className="settings-field">
              <label htmlFor="f-dueno">Nombre del Dueño</label>
              <input
                id="f-dueno"
                type="text"
                value={form.nombreDueño ?? ''}
                onChange={e => set('nombreDueño', e.target.value)}
                placeholder="Ej: Carlos Pérez"
              />
            </div>

            {/* Propiedad */}
            <div className="settings-field modal-full">
              <label htmlFor="f-propiedad">Propiedad Asignada (Edificio / Apto / Hab) *</label>
              <input
                id="f-propiedad"
                type="text"
                value={form.propiedadAsignada}
                onChange={e => set('propiedadAsignada', e.target.value)}
                placeholder="Ej: Edificio Las Palmas / Apto 2A"
              />
              {errores.propiedadAsignada && (
                <span className="field-error">{errores.propiedadAsignada}</span>
              )}
            </div>

            {/* Monto */}
            <div className="settings-field">
              <label htmlFor="f-monto">Monto de Alquiler (RD$) *</label>
              <input
                id="f-monto"
                type="number"
                min="1"
                value={form.montoAlquiler || ''}
                onChange={e => set('montoAlquiler', Number(e.target.value))}
                placeholder="15000"
              />
              {errores.montoAlquiler && <span className="field-error">{errores.montoAlquiler}</span>}
            </div>

            {/* Comisión */}
            <div className="settings-field">
              <label htmlFor="f-comision">Comisión (%) *</label>
              <input
                id="f-comision"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={form.comisionPorcentaje || ''}
                onChange={e => set('comisionPorcentaje', Number(e.target.value))}
                placeholder="10"
              />
              {errores.comisionPorcentaje && (
                <span className="field-error">{errores.comisionPorcentaje}</span>
              )}
            </div>

            {/* Día de pago */}
            <div className="settings-field">
              <label htmlFor="f-diapago">Día de Pago del Mes (1–31) *</label>
              <input
                id="f-diapago"
                type="number"
                min="1"
                max="31"
                value={form.diaPagoMes || ''}
                onChange={e => set('diaPagoMes', Number(e.target.value))}
                placeholder="1"
              />
              {errores.diaPagoMes && <span className="field-error">{errores.diaPagoMes}</span>}
            </div>

            {/* Paga a mes vencido */}
            <div className="settings-field" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                id="f-mesvencido"
                type="checkbox"
                checked={form.pagaMesVencido || false}
                onChange={e => set('pagaMesVencido', e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="f-mesvencido" style={{ marginBottom: 0, cursor: 'pointer' }}>
                Paga a mes vencido (ej. paga Julio en Agosto)
              </label>
            </div>

            {/* Día entrega dueño */}
            <div className="settings-field">
              <label htmlFor="f-diaentrega">Día de Entrega al Dueño (1–31) *</label>
              <input
                id="f-diaentrega"
                type="number"
                min="1"
                max="31"
                value={form.diaEntregaDueño || ''}
                onChange={e => set('diaEntregaDueño', Number(e.target.value))}
                placeholder="10"
              />
              {errores.diaEntregaDueño && (
                <span className="field-error">{errores.diaEntregaDueño}</span>
              )}
            </div>

            {/* Último mes pagado */}
            <div className="settings-field">
              <label htmlFor="f-ultimo-pago">Último Mes Pagado (Opcional)</label>
              <input
                id="f-ultimo-pago"
                type="month"
                value={form.ultimoMesPagado ?? ''}
                onChange={e => set('ultimoMesPagado', e.target.value)}
              />
              <span className="field-hint" style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>
                Si se deja en blanco, el sistema asume que entra en vigencia en el mes actual.
              </span>
            </div>

          </div>

          {/* Preview comisión */}
          {form.montoAlquiler > 0 && form.comisionPorcentaje > 0 && (
            <div className="modal-preview">
              <span>
                💡 Comisión estimada:{' '}
                <strong>{formatMonto(form.montoAlquiler * (form.comisionPorcentaje / 100))}</strong>
              </span>
              <span>
                Neto al dueño:{' '}
                <strong>
                  {formatMonto(
                    form.montoAlquiler - form.montoAlquiler * (form.comisionPorcentaje / 100)
                  )}
                </strong>
              </span>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn-date" onClick={onCancelar}>
              Cancelar
            </button>
            <button type="submit" className="btn-export">
              {modo === 'agregar' ? '➕ Agregar Inquilino' : '💾 Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Administracion ───────────────────────────────────────────────────────────

export default function Administracion({
  inquilinos,
  pagos,
  entregas,
  registrarPago,
  mesesFijados,
  toggleMesFijado,
  onAgregar,
  onEditar,
  onEliminar,
}: AdministracionProps) {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [inquilinoEditando, setInquilinoEditando] = useState<Inquilino | null>(null)
  const [confirmarEliminar, setConfirmarEliminar] = useState<string | null>(null)
  
  const { tablasMensuales } = useDashboard(inquilinos, pagos, entregas)
  const [mesSeleccionado, setMesSeleccionado] = useState<string>('')
  
  const currentMesSeleccionado = mesSeleccionado || (tablasMensuales.length > 0 ? tablasMensuales[tablasMensuales.length - 1].mesKey : '')
  const tablaSeleccionada = tablasMensuales.find(t => t.mesKey === currentMesSeleccionado)

  function abrirAgregar() {
    setInquilinoEditando(null)
    setModalAbierto(true)
  }

  function abrirEditar(inq: Inquilino) {
    setInquilinoEditando(inq)
    setModalAbierto(true)
  }

  function cerrarModal() {
    setModalAbierto(false)
    setInquilinoEditando(null)
  }

  function handleSubmit(data: FormData) {
    if (inquilinoEditando) {
      onEditar(inquilinoEditando.id, data)
    } else {
      onAgregar(data)
    }
    cerrarModal()
  }

  const formInicial: FormData = inquilinoEditando
    ? {
        nombre: inquilinoEditando.nombre,
        propiedadAsignada: inquilinoEditando.propiedadAsignada,
        nombreDueño: inquilinoEditando.nombreDueño ?? '',
        montoAlquiler: inquilinoEditando.montoAlquiler,
        comisionPorcentaje: inquilinoEditando.comisionPorcentaje,
        diaPagoMes: inquilinoEditando.diaPagoMes,
        diaEntregaDueño: inquilinoEditando.diaEntregaDueño,
      }
    : FORM_VACIO

  // ── Estadísticas por Dueño ───────────────────────────────────────────────
  const statsPorDueño = useMemo(() => {
    const grupos: Record<string, {
      cantidad: number,
      potencialBruto: number,
      potencialComision: number
    }> = {}

    inquilinos.forEach(inq => {
      const dueno = inq.nombreDueño?.trim() || 'Sin especificar'
      if (!grupos[dueno]) {
        grupos[dueno] = { cantidad: 0, potencialBruto: 0, potencialComision: 0 }
      }
      grupos[dueno].cantidad++
      grupos[dueno].potencialBruto += inq.montoAlquiler
      grupos[dueno].potencialComision += inq.montoAlquiler * (inq.comisionPorcentaje / 100)
    })

    return Object.entries(grupos)
      .map(([dueno, stats]) => ({ dueno, ...stats }))
      .sort((a, b) => b.potencialBruto - a.potencialBruto) // Ordenar por mayor volumen
  }, [inquilinos])

  return (
    <div className="page-admin">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <p className="page-super">Gestión de Contratos</p>
          <h1 className="page-title">Administración</h1>
        </div>
        <div className="page-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start' }}>
          <div className="dash-date-tag" style={{ margin: 0 }}>
            📅 {formatFecha(new Date())}
          </div>
          <button id="btn-agregar-inquilino" className="btn-export" onClick={abrirAgregar}>
            + Agregar Inquilino
          </button>
        </div>
      </div>

      {/* ── Stats bar por Dueño ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
        {statsPorDueño.map(stat => (
          <div key={stat.dueno} className="admin-stats-bar">
            <div className="admin-stat">
              <span className="admin-stat-num" style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
                {stat.dueno}
              </span>
              <span className="admin-stat-label">Propietario</span>
            </div>
            <div className="admin-stat">
              <span className="admin-stat-num">{stat.cantidad}</span>
              <span className="admin-stat-label">Inquilinos</span>
            </div>
            <div className="admin-stat">
              <span className="admin-stat-num" style={{ fontSize: '1.25rem' }}>
                {formatMonto(stat.potencialBruto - stat.potencialComision)} / <span style={{fontSize: '0.75em', color: 'var(--text-light)'}}>{formatMonto(stat.potencialBruto)}</span>
              </span>
              <span className="admin-stat-label">Potencial Neto / Bruto</span>
            </div>
            <div className="admin-stat">
              <span className="admin-stat-num">{formatMonto(stat.potencialComision)}</span>
              <span className="admin-stat-label">Potencial de Comisión</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Lista de Inquilinos ── */}
      {inquilinos.length === 0 ? (
        <div className="empty-state">
          <span>🏠</span>
          <p>
            No hay inquilinos registrados.
            <br />
            Haz clic en <strong>"+ Agregar Inquilino"</strong> para comenzar.
          </p>
        </div>
      ) : (
        <div className="reports-list">
          {inquilinos.map(inq => (
            <div key={inq.id} id={`admin-inq-${inq.id}`} className="admin-inq-row">
              {/* Avatar */}
              <div
                className="table-avatar admin-avatar"
                style={{ background: getAvatarColor(inq.id) }}
              >
                {getInitials(inq.nombre)}
              </div>

              {/* Info Principal */}
              <div className="admin-inq-info">
                <div className="user-name">{inq.nombre}</div>
                <div className="user-email">{inq.propiedadAsignada}</div>
                {inq.nombreDueño && (
                  <div className="admin-dueno-tag">👤 {inq.nombreDueño}</div>
                )}
              </div>

              {/* Metadata */}
              <div className="admin-inq-meta">
                <div className="admin-meta-item">
                  <span className="admin-meta-label">Alquiler</span>
                  <span className="admin-meta-value">{formatMonto(inq.montoAlquiler)}</span>
                </div>
                <div className="admin-meta-item">
                  <span className="admin-meta-label">Comisión</span>
                  <span className="admin-meta-value">{inq.comisionPorcentaje}%</span>
                </div>
                <div className="admin-meta-item">
                  <span className="admin-meta-label">Día Pago</span>
                  <span className="admin-meta-value">Día {inq.diaPagoMes}</span>
                </div>
                <div className="admin-meta-item">
                  <span className="admin-meta-label">Entrega Dueño</span>
                  <span className="admin-meta-value">Día {inq.diaEntregaDueño}</span>
                </div>
              </div>

              {/* Acciones */}
              <div className="admin-inq-actions">
                {confirmarEliminar === inq.id ? (
                  <div className="confirm-delete">
                    <span className="confirm-msg">¿Eliminar?</span>
                    <button
                      id={`confirm-yes-${inq.id}`}
                      className="btn-confirm-yes"
                      onClick={() => { onEliminar(inq.id); setConfirmarEliminar(null) }}
                    >
                      Sí
                    </button>
                    <button
                      id={`confirm-no-${inq.id}`}
                      className="btn-confirm-no"
                      onClick={() => setConfirmarEliminar(null)}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      id={`edit-${inq.id}`}
                      className="btn-edit-inq"
                      title="Editar"
                      onClick={() => abrirEditar(inq)}
                    >
                      ✏️
                    </button>
                    <button
                      id={`delete-${inq.id}`}
                      className="btn-delete-inq"
                      title="Eliminar"
                      onClick={() => setConfirmarEliminar(inq.id)}
                    >
                      🗑️
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Historial de Pagos ── */}
      <div className="activity-card" style={{ marginTop: '2rem' }}>
        <div className="activity-header">
          <div>
            <h3 className="chart-title">🕰️ Historial de Pagos</h3>
            <p className="chart-sub">Consulta y modifica pagos de meses anteriores.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select 
              value={currentMesSeleccionado}
              onChange={e => setMesSeleccionado(e.target.value)}
              className="admin-month-select"
              style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-lighter)', color: 'var(--text)' }}
            >
              {tablasMensuales.slice().reverse().map(t => (
                <option key={t.mesKey} value={t.mesKey}>{t.mesLabel}</option>
              ))}
            </select>
            
            {currentMesSeleccionado && currentMesSeleccionado !== tablasMensuales[tablasMensuales.length - 1]?.mesKey && (
              <button
                className={mesesFijados.includes(currentMesSeleccionado) ? 'btn-desmarcar' : 'btn-entregado'}
                onClick={() => toggleMesFijado(currentMesSeleccionado)}
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              >
                {mesesFijados.includes(currentMesSeleccionado) ? 'Ocultar del Dashboard' : '📌 Mostrar en Dashboard'}
              </button>
            )}
          </div>
        </div>

        {tablaSeleccionada && (
          <table className="activity-table" style={{ marginTop: '1rem' }}>
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
              {tablaSeleccionada.inquilinos.map(inq => (
                <FilaPago
                  key={inq.id}
                  inq={inq}
                  mesKey={tablaSeleccionada.mesKey}
                  onPago={registrarPago}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal Formulario ── */}
      {modalAbierto && (
        <FormularioInquilino
          inicial={formInicial}
          modo={inquilinoEditando ? 'editar' : 'agregar'}
          onSubmit={handleSubmit}
          onCancelar={cerrarModal}
        />
      )}
    </div>
  )
}
