import React, { useState, useEffect } from 'react'
import {
  Container,
  Box,
  Button,
  Typography,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

export default function Vehicles({ user }) {
  const [vehicles, setVehicles] = useState([])
  const [mechanics, setMechanics] = useState([])
  const [assignedVehicleIds, setAssignedVehicleIds] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    load()
    if (user?.role === 'Kepala_Mekanik') loadMechanics()
  }, [])

  const loadMechanics = async () => {
    try {
      const data = await window.api.getMechanics()
      setMechanics(data || [])
    } catch (err) {
      console.error('Failed to load mechanics', err)
    }
  }

  const load = async () => {
    setLoading(true)
    try {
      const data = await window.api.getKendaraan()
      setVehicles(data)
      if (user?.role !== 'Kepala_Mekanik' && data.length > 0 && data[0].assigned_mechanic_id === undefined) {
        await loadAssignedMap(data)
      }
    } finally {
      setLoading(false)
    }
  }

  const loadAssignedMap = async (vehiclesData) => {
    const assigned = {}
    for (const v of vehiclesData) {
      try {
        const task = await window.api.getAssignedRepairByVehicle({ nomor_polisi: v.nomor_polisi, id_user: user?.id_user })
        if (task) {
          assigned[v.nomor_polisi] = task.id_log
        }
      } catch (err) {
        // ignore items without assignment
      }
    }
    setAssignedVehicleIds(assigned)
  }

  const handleDelete = async (nomor_polisi) => {
    const result = await Swal.fire({
      title: 'Hapus kendaraan?',
      text: `Kendaraan ${nomor_polisi} akan dihapus. Ini tidak dapat dibatalkan.`,
      icon: 'warning',
      background: '#1E1E1E',
      color: '#FFF',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#555',
      confirmButtonText: 'Ya, hapus'
    })
    if (!result.isConfirmed) return
    try {
      await window.api.deleteKendaraan(nomor_polisi)
      await load()
      Swal.fire({
        title: 'Terhapus',
        text: 'Kendaraan berhasil dihapus',
        icon: 'success',
        background: '#1E1E1E',
        color: '#FFF'
      })
    } catch (err) {
      Swal.fire({
        title: 'Gagal',
        text: err.message || String(err),
        icon: 'error',
        background: '#1E1E1E',
        color: '#FFF'
      })
    }
  }

  const handleAssign = async (nomor_polisi) => {
    if (!mechanics.length) {
      await loadMechanics()
    }

    const options = mechanics.reduce((acc, item) => {
      const mechanicId = item.id_user ?? item.id_mekanik
      if (mechanicId !== undefined && mechanicId !== null) {
        acc[mechanicId] = `${item.nama} (${item.username})`
      }
      return acc
    }, {})

    const result = await Swal.fire({
      title: 'Pilih mekanik',
      input: 'select',
      inputOptions: options,
      inputPlaceholder: 'Pilih mekanik',
      background: '#1E1E1E',
      color: '#FFF',
      showCancelButton: true,
      confirmButtonColor: '#FFC107',
      confirmButtonText: '<span style="color: #000; font-weight: bold;">Tugaskan</span>',
      cancelButtonColor: '#555',
    })

    if (!result.isConfirmed || !result.value) return

    try {
      await window.api.assignRepair({
        nomor_polisi,
        id_mekanik: parseInt(result.value, 10),
        id_assigned_by: user.id_user
      })
      await load()
      Swal.fire({
        title: 'Berhasil',
        text: 'Mekanik berhasil ditugaskan.',
        icon: 'success',
        background: '#1E1E1E',
        color: '#FFF'
      })
    } catch (err) {
      Swal.fire({
        title: 'Gagal',
        text: err.message || String(err),
        icon: 'error',
        background: '#1E1E1E',
        color: '#FFF'
      })
    }
  }

  const handleToggleStatus = async (nomor_polisi, currentStatus) => {
    const targetStatus = currentStatus === 'Aktif' ? 'Diperbaiki' : 'Aktif'
    const result = await Swal.fire({
      title: `Ubah status menjadi ${targetStatus}?`,
      text: `Kendaraan ${nomor_polisi} akan diubah statusnya menjadi ${targetStatus}.`,
      icon: 'question',
      background: '#1E1E1E',
      color: '#FFF',
      showCancelButton: true,
      confirmButtonColor: '#FFC107',
      confirmButtonText: '<span style="color: #000; font-weight: bold;">Ya, ubah</span>',
      cancelButtonColor: '#555',
    })
    if (!result.isConfirmed) return
    try {
      await window.api.updateKendaraanStatus({ nomor_polisi, status: targetStatus })
      await load()
      Swal.fire({
        title: 'Berhasil',
        text: `Status kendaraan diubah menjadi ${targetStatus}`,
        icon: 'success',
        background: '#1E1E1E',
        color: '#FFF'
      })
    } catch (err) {
      Swal.fire({
        title: 'Gagal',
        text: err.message || String(err),
        icon: 'error',
        background: '#1E1E1E',
        color: '#FFF'
      })
    }
  }

  // Gaya tombol utama (Warna Kuning)
  const yellowButtonStyle = {
    backgroundColor: '#FFC107',
    color: '#000000',
    fontWeight: 'bold',
    textTransform: 'none',
    borderRadius: 1.5,
    px: 2,
    '&:hover': {
      backgroundColor: '#e0a800',
    },
    '&.Mui-disabled': {
      backgroundColor: '#444',
      color: '#888'
    }
  }

  // Gaya tombol Outline/Border Kuning
  const outlinedButtonStyle = {
    borderColor: '#FFC107',
    color: '#FFC107',
    textTransform: 'none',
    borderRadius: 1.5,
    px: 2,
    '&:hover': {
      borderColor: '#e0a800',
      backgroundColor: 'rgba(255, 193, 7, 0.08)',
    }
  }

  return (
    <Box sx={{ backgroundColor: '#121212', minHeight: '100vh', color: '#FFFFFF', pt: 4, pb: 6 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, borderBottom: '2px solid #2A2A2A', pb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
            Daftar Kendaraan <span style={{ color: '#FFC107' }}>Operasional</span>
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress sx={{ color: '#FFC107' }} />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ backgroundColor: '#1E1E1E', borderRadius: 3, boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.3)', overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#2A2A2A' }}>
                <TableRow>
                  {['Nomor Polisi', 'Tahun', 'Odometer', 'Status', 'Mekanik', 'Aksi'].map((head) => (
                    <TableCell key={head} sx={{ color: '#FFC107', fontWeight: 'bold', borderBottom: '1px solid #333' }}>
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {vehicles.map((v) => {
                  const assignedToMe = v.assigned_mechanic_id === user?.id_user || Boolean(assignedVehicleIds[v.nomor_polisi])
                  const isDiperbaiki = v.status === 'Diperbaiki'

                  return (
                    <TableRow 
                      key={v.nomor_polisi} 
                      sx={{ 
                        backgroundColor: isDiperbaiki ? '#2d2715' : 'transparent',
                        '&:hover': { backgroundColor: isDiperbaiki ? '#3a321a' : '#252525' }
                      }}
                    >
                      <TableCell sx={{ color: '#FFF', borderBottom: '1px solid #2A2A2A', fontWeight: 600 }}>{v.nomor_polisi}</TableCell>
                      <TableCell sx={{ color: '#AAA', borderBottom: '1px solid #2A2A2A' }}>{v.tahun}</TableCell>
                      <TableCell sx={{ color: '#AAA', borderBottom: '1px solid #2A2A2A' }}>{v.odometer} Km</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #2A2A2A' }}>
                        <span style={{ 
                          color: isDiperbaiki ? '#FFC107' : '#4CAF50', 
                          fontWeight: 'bold',
                          backgroundColor: isDiperbaiki ? 'rgba(255, 193, 7, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                          padding: '4px 8px',
                          borderRadius: '4px'
                        }}>
                          {v.status}
                        </span>
                      </TableCell>
                      <TableCell sx={{ color: '#FFF', borderBottom: '1px solid #2A2A2A' }}>{v.assigned_mechanic || '-'}</TableCell>
                      <TableCell sx={{ display: 'flex', gap: 1, alignItems: 'center', borderBottom: '1px solid #2A2A2A', py: 1.5 }}>
                        {user?.role !== 'Kepala_Mekanik' ? (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => navigate(`/repairs/${encodeURIComponent(v.nomor_polisi)}`)}
                            disabled={!assignedToMe}
                            sx={yellowButtonStyle}
                          >
                            Perbaiki
                          </Button>
                        ) : (
                          <>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleToggleStatus(v.nomor_polisi, v.status)}
                              sx={outlinedButtonStyle}
                            >
                              {v.status === 'Aktif' ? 'Set Diperbaiki' : 'Set Aktif'}
                            </Button>
                            <Button 
                              size="small" 
                              variant="contained"
                              onClick={() => handleAssign(v.nomor_polisi)}
                              sx={yellowButtonStyle}
                            >
                              {v.assigned_mechanic ? 'Tugaskan Ulang' : 'Tugaskan'}
                            </Button>
                            <Button 
                              color="error" 
                              size="small" 
                              variant="text"
                              onClick={() => handleDelete(v.nomor_polisi)}
                              sx={{ textTransform: 'none', fontWeight: 'bold', '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.08)' } }}
                            >
                              Hapus
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Box>
  )
}