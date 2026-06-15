import { Router } from 'express'
import type { Request, Response } from 'express'
import pool from '../db.js'

const router = Router()

// ── GET /api/pagos?mes=YYYY-MM ────────────────────────────────────────────────
// Devuelve el mapa de pagos del mes: { "inq-1": true, "inq-2": false, ... }

router.get('/', async (req: Request, res: Response) => {
  const mes = req.query.mes as string | undefined

  if (!mes || !/^\d{4}-\d{2}$/.test(mes)) {
    res.status(400).json({ error: 'El parámetro "mes" es requerido con formato YYYY-MM' })
    return
  }

  try {
    const { rows } = await pool.query(
      'SELECT inquilino_id, pagado FROM pagos WHERE year_month = $1',
      [mes]
    )

    // Construir el mismo formato que usa el frontend: Record<string, boolean>
    const pagosMes: Record<string, boolean> = {}
    for (const row of rows) {
      pagosMes[row.inquilino_id as string] = row.pagado as boolean
    }

    res.json(pagosMes)
  } catch (err) {
    console.error('GET /api/pagos error:', err)
    res.status(500).json({ error: 'Error al obtener pagos' })
  }
})

// ── PUT /api/pagos ────────────────────────────────────────────────────────────
// Registra o desmarca el pago de un inquilino para un mes dado.
// Body: { inquilinoId: string, yearMonth: string, pagado: boolean }

router.put('/', async (req: Request, res: Response) => {
  const { inquilinoId, yearMonth, pagado } = req.body as {
    inquilinoId: string
    yearMonth:   string
    pagado:      boolean
  }

  if (!inquilinoId || !yearMonth || typeof pagado !== 'boolean') {
    res.status(400).json({ error: 'inquilinoId, yearMonth y pagado son requeridos' })
    return
  }

  try {
    if (pagado) {
      // Insertar o actualizar a pagado=true
      await pool.query(
        `INSERT INTO pagos (inquilino_id, year_month, pagado)
         VALUES ($1, $2, TRUE)
         ON CONFLICT (inquilino_id, year_month)
         DO UPDATE SET pagado = TRUE, fecha_pago = NOW()`,
        [inquilinoId, yearMonth]
      )
    } else {
      // Desmarcar: eliminar el registro (equivale a "no pagado")
      await pool.query(
        'DELETE FROM pagos WHERE inquilino_id = $1 AND year_month = $2',
        [inquilinoId, yearMonth]
      )
    }

    res.json({ ok: true, inquilinoId, yearMonth, pagado })
  } catch (err) {
    console.error('PUT /api/pagos error:', err)
    res.status(500).json({ error: 'Error al registrar pago' })
  }
})

export default router
