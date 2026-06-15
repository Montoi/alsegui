import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import pool from './db.js'
import inquilinosRouter from './routes/inquilinos.js'
import pagosRouter from './routes/pagos.js'

const app  = express()
const PORT = process.env.PORT ?? 3001

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(cors())
app.use(express.json())

// ── Health check ──────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Rutas ─────────────────────────────────────────────────────────────────────

app.use('/api/inquilinos', inquilinosRouter)
app.use('/api/pagos',      pagosRouter)

// ── 404 genérico ──────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

// ── Arranque ──────────────────────────────────────────────────────────────────

async function start() {
  // Verificar conexión a la base de datos antes de aceptar tráfico
  try {
    await pool.query('SELECT 1')
    console.log('✅ Conexión a PostgreSQL establecida')
  } catch (err) {
    console.error('❌ No se pudo conectar a PostgreSQL:', err)
    process.exit(1)
  }

  app.listen(PORT, () => {
    console.log(`🚀 API corriendo en http://localhost:${PORT}`)
  })
}

start()
