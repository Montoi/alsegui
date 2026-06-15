import { useState } from 'react'
import type { Inquilino, Pagos } from '../types'
import { MOCK_INQUILINOS, INITIAL_PAGOS } from '../data/mockData'

/**
 * Hook de Administración.
 * Maneja el estado global de inquilinos y el registro de pagos por mes.
 * Es la única fuente de verdad para el resto de la app.
 */
export function useAdministracion() {
  const [inquilinos, setInquilinos] = useState<Inquilino[]>(MOCK_INQUILINOS)
  const [pagos, setPagos] = useState<Pagos>(INITIAL_PAGOS)

  // ─── CRUD de Inquilinos ─────────────────────────────────────────────────────

  function agregarInquilino(data: Omit<Inquilino, 'id'>): void {
    const nuevo: Inquilino = { ...data, id: `inq-${Date.now()}` }
    setInquilinos(prev => [...prev, nuevo])
  }

  function editarInquilino(id: string, data: Partial<Omit<Inquilino, 'id'>>): void {
    setInquilinos(prev =>
      prev.map(inq => (inq.id === id ? { ...inq, ...data } : inq))
    )
  }

  function eliminarInquilino(id: string): void {
    setInquilinos(prev => prev.filter(inq => inq.id !== id))
    // Limpiar los registros de pago del inquilino eliminado
    setPagos(prev => {
      const updated = { ...prev }
      for (const mes of Object.keys(updated)) {
        const { [id]: _, ...rest } = updated[mes]
        updated[mes] = rest
      }
      return updated
    })
  }

  // ─── Registro de Pagos ──────────────────────────────────────────────────────

  /**
   * Registra o desmarca el pago de un inquilino para un mes específico.
   * @param inquilinoId ID del inquilino
   * @param yearMonth   Clave del mes, formato "YYYY-MM" (ej: "2026-06")
   * @param pagado      true para marcar pagado, false para desmarcar
   */
  function registrarPago(inquilinoId: string, yearMonth: string, pagado: boolean): void {
    setPagos(prev => ({
      ...prev,
      [yearMonth]: {
        ...(prev[yearMonth] ?? {}),
        [inquilinoId]: pagado,
      },
    }))
  }

  return {
    inquilinos,
    pagos,
    agregarInquilino,
    editarInquilino,
    eliminarInquilino,
    registrarPago,
  }
}
