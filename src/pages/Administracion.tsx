import { useState } from 'react'
import type { Inquilino } from '../types'
import { getInitials, getAvatarColor, formatMonto, formatFecha } from '../utils/format'

// ─── Props ────────────────────────────────────────────────────────────────────

interface AdministracionProps {
  inquilinos: Inquilino[]
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
  onAgregar,
  onEditar,
  onEliminar,
}: AdministracionProps) {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [inquilinoEditando, setInquilinoEditando] = useState<Inquilino | null>(null)
  const [confirmarEliminar, setConfirmarEliminar] = useState<string | null>(null)

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

  // ── Estadísticas rápidas ─────────────────────────────────────────────────
  const potencialBruto = inquilinos.reduce((s, i) => s + i.montoAlquiler, 0)
  const potencialComision = inquilinos.reduce(
    (s, i) => s + i.montoAlquiler * (i.comisionPorcentaje / 100),
    0
  )
  const cantidadDueños = new Set(
    inquilinos.map(i => i.nombreDueño ?? i.propiedadAsignada)
  ).size
  return (
    <div className="page-admin">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <p className="page-super">Gestión de Contratos</p>
          <h1 className="page-title">Administración</h1>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="dash-date-tag" style={{ margin: 0 }}>
            📅 {formatFecha(new Date())}
          </div>
          <button id="btn-agregar-inquilino" className="btn-export" onClick={abrirAgregar}>
            + Agregar Inquilino
          </button>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="admin-stats-bar" style={{ marginTop: '0.5rem' }}>
        <div className="admin-stat">
          <span className="admin-stat-num">{inquilinos.length}</span>
          <span className="admin-stat-label">Inquilinos</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-num">{cantidadDueños}</span>
          <span className="admin-stat-label">Dueños</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-num" style={{ fontSize: '1.25rem' }}>
            {formatMonto(potencialBruto - potencialComision)} / <span style={{fontSize: '0.75em', color: 'var(--text-light)'}}>{formatMonto(potencialBruto)}</span>
          </span>
          <span className="admin-stat-label">Potencial Neto / Bruto</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-num">{formatMonto(potencialComision)}</span>
          <span className="admin-stat-label">Potencial de Comisión</span>
        </div>
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
