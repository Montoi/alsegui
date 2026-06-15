import pg from 'pg'
import 'dotenv/config'

const { Pool } = pg

/**
 * Pool de conexiones a PostgreSQL.
 * Lee DATABASE_URL del entorno (configurada en docker-compose.yml / .env).
 * En desarrollo local, puedes definir DATABASE_URL en un archivo .env.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // En producción Docker, los contenedores se comunican por nombre de servicio.
  // SSL desactivado (red Docker interna privada).
  ssl: false,
})

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de PostgreSQL:', err)
  process.exit(1)
})

export default pool
