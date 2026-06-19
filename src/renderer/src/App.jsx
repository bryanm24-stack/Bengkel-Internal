import React, { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Link } from 'react-router-dom'
import { Box, Button, Typography } from '@mui/material'
import Login from './pages/Login'
import Vehicles from './pages/Vehicles'
import RepairForm from './pages/RepairForm'
import Reports from './pages/Reports'
import SpareParts from './pages/SpareParts'
import AddVehicle from './pages/AddVehicle'
import MekanikDashboard from './pages/MekanikDashboard'
import KepalaDashboard from './pages/KepalaDashboard'

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  }, [user])

  if (!user) {
    return <Login onLogin={setUser} />
  }

  const logout = () => setUser(null)

  // Gaya standar tombol navigasi teks putih
  const navButtonStyle = {
    color: '#FFFFFF',
    textTransform: 'none',
    fontWeight: 600,
    mx: 0.5,
    '&:hover': {
      color: '#FFC107',
      backgroundColor: 'rgba(255, 193, 7, 0.05)'
    }
  }

  return (
    <HashRouter>
      {/* Navbar Container - Dark Mode Theme */}
      <Box 
        className="no-print" 
        sx={{ 
          p: 2, 
          backgroundColor: '#1E1E1E', 
          borderBottom: '2px solid #2A2A2A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.3)',
          // Menyembunyikan total seluruh navbar saat cetak PDF laporan berjalan
          '@media print': {
            display: 'none !important'
          }
        }}
      >
        {/* Sisi Kiri: Logo Singkat & Navigasi Utama */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 800, 
              color: '#FFFFFF', 
              letterSpacing: 0.5, 
              mr: 3,
              fontSize: '1.1rem' 
            }}
          >
            BENGKEL<span style={{ color: '#FFC107' }}>KU</span>
          </Typography>

          <Button component={Link} to="/" sx={navButtonStyle}>
            Kendaraan
          </Button>
          <Button component={Link} to="/dashboard" sx={navButtonStyle}>
            Dashboard
          </Button>

          {user?.role === 'Kepala_Mekanik' ? (
            <>
              <Button component={Link} to="/reports" sx={navButtonStyle}>
                Laporan
              </Button>
              <Button component={Link} to="/spareparts" sx={navButtonStyle}>
                Suku Cadang
              </Button>
              <Button 
                variant="contained" 
                component={Link} 
                to="/vehicles/add" 
                sx={{ 
                  ml: 1,
                  backgroundColor: '#FFC107',
                  color: '#000000',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  borderRadius: 1.5,
                  boxShadow: '0px 4px 10px rgba(255, 193, 7, 0.2)',
                  '&:hover': {
                    backgroundColor: '#e0a800',
                  }
                }}
              >
                + Tambah Kendaraan
              </Button>
            </>
          ) : null}
        </Box>

        {/* Sisi Kanan: Logout */}
        <Button 
          onClick={logout}
          sx={{ 
            color: '#FF5252', 
            fontWeight: 'bold',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'rgba(255, 82, 82, 0.08)'
            }
          }}
        >
          Logout
        </Button>
      </Box>

      {/* Konten Halaman Rute */}
      <Routes>
        <Route
          path="/dashboard"
          element={
            user?.role === 'Kepala_Mekanik' ? (
              <KepalaDashboard user={user} />
            ) : (
              <MekanikDashboard user={user} />
            )
          }
        />
        <Route path="/" element={<Vehicles user={user} />} />
        {user?.role !== 'Kepala_Mekanik' && (
          <>
            <Route path="/repairs" element={<RepairForm user={user} />} />
            <Route path="/repairs/:nomor_polisi" element={<RepairForm user={user} />} />
          </>
        )}
        {user?.role === 'Kepala_Mekanik' && (
          <>
            <Route path="/reports" element={<Reports user={user} />} />
            <Route path="/spareparts" element={<SpareParts />} />
            <Route path="/vehicles/add" element={<AddVehicle />} />
          </>
        )}
      </Routes>
    </HashRouter>
  )
}