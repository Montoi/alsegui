import { useState } from 'react'
import './App.css'

import Sidebar         from './components/Sidebar'
import Topbar          from './components/Topbar'
import Dashboard       from './pages/Dashboard'
import Administracion  from './pages/Administracion'
import Finanzas        from './pages/Finanzas'

import { useAdministracion } from './hooks/useAdministracion'
import type { Page } from './types'

export default function App() {
  const [page, setPage] = useState<Page>('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const {
    inquilinos,
    pagos,
    entregas,
    agregarInquilino,
    editarInquilino,
    eliminarInquilino,
    registrarPago,
    marcarEntrega,
  } = useAdministracion()

  return (
    <div className="dashboard">
      <Sidebar 
        activePage={page} 
        onNavigate={setPage} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div className="main">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

        <div className="content">
          {page === 'dashboard' && (
            <Dashboard
              inquilinos={inquilinos}
              pagos={pagos}
              entregas={entregas}
              registrarPago={registrarPago}
              marcarEntrega={marcarEntrega}
            />
          )}

          {page === 'administracion' && (
            <Administracion
              inquilinos={inquilinos}
              onAgregar={agregarInquilino}
              onEditar={editarInquilino}
              onEliminar={eliminarInquilino}
            />
          )}

          {page === 'finanzas' && (
            <Finanzas
              inquilinos={inquilinos}
              pagos={pagos}
            />
          )}
        </div>
      </div>
    </div>
  )
}
