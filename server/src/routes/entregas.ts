import { Router } from 'express'
import type { Request, Response } from 'express'
import pool from '../db.js'

const router = Router()

// ── GET /api/entregas ──────────────────────────────────────────────────────────
// Devuelve: { "María": ["2026-06"], "Jairo": [] }

router.get('/', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      'SELECT dueno_key, year_month FROM entregas_dueno ORDER BY year_month'
    )
    const resultado: Record<string, string[]> = {}
    for (const row of rows) {
      const key = row.dueno_key as string
      if (!resultado[key]) resultado[key] = []
      resultado[key].push(row.year_month as string)
    }
    res.json(resultado)
  } catch (err) {
    console.error('GET /api/entregas error:', err)
    res.status(500).json({ error: 'Error al obtener entregas' })
  }
})

// ── PUT /api/entregas ─────────────────────────────────────────────────────────
// Body: { duenoKey: string, yearMonth: string, entregado: boolean }

router.put('/', async (req: Request, res: Response) => {
  const { duenoKey, yearMonth, entregado } = req.body as {
    duenoKey:  string
    yearMonth: string
    entregado: boolean
  }

  if (!duenoKey || !yearMonth || typeof entregado !== 'boolean') {
    res.status(400).json({ error: 'duenoKey, yearMonth y entregado son requeridos' })
    return
  }

  try {
    if (entregado) {
      await pool.query(
        `INSERT INTO entregas_dueno (dueno_key, year_month)
         VALUES ($1, $2)
         ON CONFLICT (dueno_key, year_month) DO NOTHING`,
        [duenoKey, yearMonth]
      )
    } else {
      await pool.query(
        'DELETE FROM entregas_dueno WHERE dueno_key = $1 AND year_month = $2',
        [duenoKey, yearMonth]
      )
    }
    res.json({ ok: true, duenoKey, yearMonth, entregado })
  } catch (err) {
    console.error('PUT /api/entregas error:', err)
    res.status(500).json({ error: 'Error al registrar entrega' })
  }
})

export default router
