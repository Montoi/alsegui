-- ============================================================
-- Alsegui — Esquema de Base de Datos
-- Se ejecuta automáticamente en el primer arranque del contenedor
-- ============================================================

-- ── Tabla de Inquilinos ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS inquilinos (
  id               TEXT PRIMARY KEY,
  nombre           TEXT        NOT NULL,
  propiedad        TEXT        NOT NULL,
  nombre_dueno     TEXT,
  monto_alquiler   NUMERIC(12, 2) NOT NULL,
  comision_pct     NUMERIC(5, 2)  NOT NULL DEFAULT 10,
  dia_pago_mes     INTEGER        NOT NULL DEFAULT 1  CHECK (dia_pago_mes  BETWEEN 1 AND 31),
  dia_entrega      INTEGER        NOT NULL DEFAULT 10 CHECK (dia_entrega    BETWEEN 1 AND 31),
  created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ── Tabla de Pagos ───────────────────────────────────────────
-- Un registro por inquilino × mes. pagado=true significa que pagó ese mes.

CREATE TABLE IF NOT EXISTS pagos (
  id           SERIAL      PRIMARY KEY,
  inquilino_id TEXT        NOT NULL REFERENCES inquilinos(id) ON DELETE CASCADE,
  year_month   TEXT        NOT NULL,   -- formato "YYYY-MM"
  pagado       BOOLEAN     NOT NULL DEFAULT TRUE,
  fecha_pago   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (inquilino_id, year_month)
);

-- ── Índices ──────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_pagos_year_month   ON pagos (year_month);
CREATE INDEX IF NOT EXISTS idx_pagos_inquilino_id ON pagos (inquilino_id);

-- ── Seed Data ─────────────────────────────────────────────────
-- Los 6 inquilinos de muestra. ON CONFLICT evita errores si el
-- contenedor se reinicia sin borrar el volumen.

INSERT INTO inquilinos (id, nombre, propiedad, nombre_dueno, monto_alquiler, comision_pct, dia_pago_mes, dia_entrega)
VALUES
  ('inq-1', 'Ivan',         'Propiedad Ivan',         'María', 18000, 10, 30, 10),
  ('inq-2', 'Leonarda',     'Propiedad Leonarda',     'María',  7000, 10, 14, 10),
  ('inq-3', 'Gastón',       'Propiedad Gastón',       'María', 20000, 10, 12, 10),
  ('inq-4', 'Miguel angel', 'Propiedad Miguel angel', 'María', 15000, 10,  1, 10),
  ('inq-5', 'Wendy',        'Propiedad Wendy',        'María', 15000, 10, 15, 10),
  ('inq-6', 'Digno',        'Propiedad Digno',        'María',  5000, 10, 19, 10),
  ('inq-7', 'Aníbal',       'Propiedad Aníbal',       'María',  7000, 10, 17, 10),
  ('inq-8', 'Carlitos',     'Propiedad Carlitos',     'María', 20000,  0,  1, 10)
ON CONFLICT (id) DO NOTHING;
