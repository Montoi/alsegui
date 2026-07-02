import { useState, useEffect, useCallback } from 'react'
import type { Inquilino, Pagos, Entregas } from '../types'

/**
 * Hook de Administración.
 * Maneja el estado global de inquilinos y el registro de pagos por mes,
 * comunicándose con el backend REST API.
 */
export function useAdministracion() {
  const [inquilinos, setInquilinos] = useState<Inquilino[]>([])
  const [pagos, setPagos] = useState<Pagos>({})
  const [entregas, setEntregas] = useState<Entregas>({})
  const [loading, setLoading] = useState(true)

  // ─── Carga Inicial ──────────────────────────────────────────────────────────

  const fetchInquilinos = useCallback(async () => {
    try {
      const res = await fetch('/api/inquilinos')
      if (res.ok) {
        const data = await res.json()
        setInquilinos(data)
      }
    } catch (err) {
      console.error('Error fetching inquilinos:', err)
    }
  }, [])

  const fetchTodosPagos = useCallback(async () => {
    try {
      const res = await fetch('/api/pagos')
      if (res.ok) {
        const data = await res.json()
        setPagos(data)
      }
    } catch (err) {
      console.error('Error fetching all pagos:', err)
    }
  }, [])

  const fetchEntregas = useCallback(async () => {
    try {
      const res = await fetch('/api/entregas')
      if (res.ok) {
        const data = await res.json()
        setEntregas(data)
      }
    } catch (err) {
      console.error('Error fetching entregas:', err)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([
        fetchInquilinos(),
        fetchTodosPagos(),
        fetchEntregas(),
      ])
      setLoading(false)
    }
    init()
  }, [fetchInquilinos, fetchTodosPagos, fetchEntregas])

  // ─── CRUD de Inquilinos ─────────────────────────────────────────────────────

  async function agregarInquilino(data: Omit<Inquilino, 'id'>): Promise<void> {
    try {
      const res = await fetch('/api/inquilinos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const nuevo = await res.json()
        setInquilinos(prev => [...prev, nuevo])
      }
    } catch (err) {
      console.error('Error adding inquilino:', err)
    }
  }

  async function editarInquilino(id: string, data: Partial<Omit<Inquilino, 'id'>>): Promise<void> {
    try {
      const res = await fetch(`/api/inquilinos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const editado = await res.json()
        setInquilinos(prev => prev.map(inq => (inq.id === id ? editado : inq)))
      }
    } catch (err) {
      console.error('Error editing inquilino:', err)
    }
  }

  async function eliminarInquilino(id: string): Promise<void> {
    try {
      const res = await fetch(`/api/inquilinos/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setInquilinos(prev => prev.filter(inq => inq.id !== id))
        // Limpiar registros en el estado local (backend usa ON DELETE CASCADE)
        setPagos(prev => {
          const updated = { ...prev }
          for (const mes of Object.keys(updated)) {
            const { [id]: _, ...rest } = updated[mes]
            updated[mes] = rest
          }
          return updated
        })
      }
    } catch (err) {
      console.error('Error deleting inquilino:', err)
    }
  }

  // ─── Registro de Pagos ──────────────────────────────────────────────────────

  async function registrarPago(inquilinoId: string, yearMonth: string, pagado: boolean): Promise<void> {
    // Actualización optimista local
    setPagos(prev => ({
      ...prev,
      [yearMonth]: {
        ...(prev[yearMonth] ?? {}),
        [inquilinoId]: pagado,
      },
    }))

    try {
      const res = await fetch('/api/pagos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquilinoId, yearMonth, pagado }),
      })
      
      if (!res.ok) {
        // Revertir en caso de error
        await fetchTodosPagos()
      }
    } catch (err) {
      console.error('Error registering pago:', err)
      await fetchTodosPagos()
    }
  }

  // ─── Registro de Entregas a Dueños ─────────────────────────────────────────

  async function marcarEntrega(duenoKey: string, yearMonth: string, entregado: boolean): Promise<void> {
    // Actualización optimista local
    setEntregas(prev => {
      const meses = prev[duenoKey] ?? []
      return {
        ...prev,
        [duenoKey]: entregado
          ? [...meses.filter(m => m !== yearMonth), yearMonth]
          : meses.filter(m => m !== yearMonth),
      }
    })

    try {
      const res = await fetch('/api/entregas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duenoKey, yearMonth, entregado }),
      })
      if (!res.ok) {
        await fetchEntregas()
      }
    } catch (err) {
      console.error('Error registering entrega:', err)
      await fetchEntregas()
    }
  }

  return {
    inquilinos,
    pagos,
    entregas,
    loading,
    agregarInquilino,
    editarInquilino,
    eliminarInquilino,
    registrarPago,
    marcarEntrega,
    fetchTodosPagos, // Exportado por si otras vistas necesitan cargar historial
  }
}
