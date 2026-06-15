import { Router } from 'express'
import type { Request, Response } from 'express'
import pool from '../db.js'

const router = Router()

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Convierte una fila de BD (snake_case) al formato que espera el frontend (camelCase) */
function rowToInquilino(row: Record<string, unknown>) {
  return {
    id:                 row.id,
    nombre:             row.nombre,
    propiedadAsignada:  row.propiedad,
    nombreDueño:        row.nombre_dueno ?? undefined,
    montoAlquiler:      Number(row.monto_alquiler),
    comisionPorcentaje: Number(row.comision_pct),
    diaPagoMes:         Number(row.dia_pago_mes),
    diaEntregaDueño:    Number(row.dia_entrega),
    ultimoMesPagado:    row.ultimo_mes_pagado ? String(row.ultimo_mes_pagado) : undefined,
  }
}

// ── GET /api/inquilinos ───────────────────────────────────────────────────────

router.get('/', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM inquilinos ORDER BY created_at ASC'
    )
    res.json(rows.map(rowToInquilino))
  } catch (err) {
    console.error('GET /api/inquilinos error:', err)
    res.status(500).json({ error: 'Error al obtener inquilinos' })
  }
})

// ── POST /api/inquilinos ──────────────────────────────────────────────────────

router.post('/', async (req: Request, res: Response) => {
  const {
    nombre,
    propiedadAsignada,
    nombreDueño,
    montoAlquiler,
    comisionPorcentaje,
    diaPagoMes,
    diaEntregaDueño,
    ultimoMesPagado,
  } = req.body as Record<string, unknown>

  // Validación básica
  if (!nombre || !propiedadAsignada || !montoAlquiler) {
    res.status(400).json({ error: 'nombre, propiedadAsignada y montoAlquiler son requeridos' })
    return
  }

  try {
    const id = `inq-${Date.now()}`
    const { rows } = await pool.query(
      `INSERT INTO inquilinos
         (id, nombre, propiedad, nombre_dueno, monto_alquiler, comision_pct, dia_pago_mes, dia_entrega, ultimo_mes_pagado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        id,
        nombre,
        propiedadAsignada,
        nombreDueño ?? null,
        montoAlquiler,
        comisionPorcentaje ?? 10,
        diaPagoMes ?? 1,
        diaEntregaDueño ?? 10,
        ultimoMesPagado ?? null,
      ]
    )
    res.status(201).json(rowToInquilino(rows[0]))
  } catch (err) {
    console.error('POST /api/inquilinos error:', err)
    res.status(500).json({ error: 'Error al crear inquilino' })
  }
})

// ── PUT /api/inquilinos/:id ───────────────────────────────────────────────────

router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  const {
    nombre,
    propiedadAsignada,
    nombreDueño,
    montoAlquiler,
    comisionPorcentaje,
    diaPagoMes,
    diaEntregaDueño,
    ultimoMesPagado,
  } = req.body as Record<string, unknown>

  try {
    const { rows } = await pool.query(
      `UPDATE inquilinos SET
         nombre         = COALESCE($1, nombre),
         propiedad      = COALESCE($2, propiedad),
         nombre_dueno   = $3,
         monto_alquiler = COALESCE($4, monto_alquiler),
         comision_pct   = COALESCE($5, comision_pct),
         dia_pago_mes   = COALESCE($6, dia_pago_mes),
         dia_entrega    = COALESCE($7, dia_entrega),
         ultimo_mes_pagado = $8
       WHERE id = $9
       RETURNING *`,
      [
        nombre ?? null,
        propiedadAsignada ?? null,
        nombreDueño ?? null,
        montoAlquiler ?? null,
        comisionPorcentaje ?? null,
        diaPagoMes ?? null,
        diaEntregaDueño ?? null,
        ultimoMesPagado ?? null,
        id,
      ]
    )

    if (rows.length === 0) {
      res.status(404).json({ error: 'Inquilino no encontrado' })
      return
    }

    res.json(rowToInquilino(rows[0]))
  } catch (err) {
    console.error(`PUT /api/inquilinos/${id} error:`, err)
    res.status(500).json({ error: 'Error al editar inquilino' })
  }
})

// ── DELETE /api/inquilinos/:id ────────────────────────────────────────────────

router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const { rowCount } = await pool.query(
      'DELETE FROM inquilinos WHERE id = $1',
      [id]
    )

    if (rowCount === 0) {
      res.status(404).json({ error: 'Inquilino no encontrado' })
      return
    }

    res.status(204).send()
  } catch (err) {
    console.error(`DELETE /api/inquilinos/${id} error:`, err)
    res.status(500).json({ error: 'Error al eliminar inquilino' })
  }
})

export default router
