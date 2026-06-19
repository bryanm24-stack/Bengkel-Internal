import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  TextField,
  MenuItem,
  Button,
  Table,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  TableContainer
} from '@mui/material'
import Swal from 'sweetalert2'
import { useParams } from 'react-router-dom'

export default function RepairForm({ user }) {
  const params = useParams()
  const preSelectedPol = params.nomor_polisi ? decodeURIComponent(params.nomor_polisi) : null
  const formReady = Boolean(preSelectedPol)
  const [kategoriList, setKategoriList] = useState([])
  const [selectedKategori, setSelectedKategori] = useState('')
  const [sukuList, setSukuList] = useState([])
  const [rows, setRows] = useState([])
  const [odometerBaru, setOdometerBaru] = useState('')
  const [assignedTask, setAssignedTask] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' })

  useEffect(() => {
    loadCategories()
  }, [])
  
  useEffect(() => {
    if (selectedKategori) loadSuku(selectedKategori)
  }, [selectedKategori])

  useEffect(() => {
    if (formReady && user?.role !== 'Kepala_Mekanik') {
      loadAssignedTask()
    }
  }, [formReady, user])

  const loadCategories = async () => {
    const cats = await window.api.getCategories()
    setKategoriList(cats || [])
  }

  const loadSuku = async (kat) => {
    setLoading(true)
    try {
      const items = await window.api.getSukuByKategori(kat)
      setSukuList(items || [])
    } finally {
      setLoading(false)
    }
  }

  const loadAssignedTask = async () => {
    try {
      const task = await window.api.getAssignedRepairByVehicle({ nomor_polisi: preSelectedPol, id_user: user?.id_user })
      setAssignedTask(task)
    } catch (err) {
      console.error('Failed to load assigned repair task', err)
      setAssignedTask(null)
    }
  }

  const addRow = () => {
    if (!formReady) return
    setRows([...rows, { id_suku_cadang: '', kuantitas_dipakai: 1 }])
  }

  const updateRow = (idx, field, value) => {
    const copy = [...rows]
    copy[idx][field] = value
    setRows(copy)
  }

  const removeRow = async (idx) => {
    // Kustomisasi SweetAlert2 dengan gaya Dark Mode
    const result = await Swal.fire({
      title: 'Hapus item?',
      text: 'Anda akan menghapus komponen ini dari transaksi.',
      icon: 'warning',
      background: '#1E1E1E',
      color: '#FFF',
      showCancelButton: true,
      confirmButtonColor: '#FF5252',
      cancelButtonColor: '#333',
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal'
    })
    if (result.isConfirmed) {
      const copy = rows.filter((_, i) => i !== idx)
      setRows(copy)
    }
  }

  const submit = async () => {
    if (!preSelectedPol)
      return setToast({ open: true, message: 'Pilih kendaraan terlebih dahulu', severity: 'error' })

    if (user?.role !== 'Kepala_Mekanik' && !assignedTask) {
      return setToast({ open: true, message: 'Anda belum ditugaskan pada kendaraan ini.', severity: 'error' })
    }

    setLoading(true)
    try {
      const id_log = assignedTask?.id_log
      if (!id_log) {
        throw new Error('Tugas perbaikan tidak ditemukan untuk kendaraan ini')
      }

      const payload = {
        id_log,
        odometer_baru: parseInt(odometerBaru, 10),
        components: rows
      }
      await window.api.completeRepair(payload)
      setToast({ open: true, message: 'Perbaikan selesai dan disimpan', severity: 'success' })
    } catch (err) {
      setToast({ open: true, message: err.message || String(err), severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // Objek styling kustom Input Dark Mode
  const darkTextFieldStyle = {
    '& .MuiInputLabel-root': { color: '#888' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#FFC107' },
    '& .MuiOutlinedInput-root': {
      color: '#FFF',
      backgroundColor: '#2A2A2A',
      borderRadius: 2,
      '& fieldset': { borderColor: 'transparent' },
      '&:hover fieldset': { borderColor: '#555' },
      '&.Mui-focused fieldset': { borderColor: '#FFC107' },
    },
    '& .MuiSelect-icon': { color: '#FFC107' }
  }

  // Objek styling dropdown menu item list
  const menuPropsStyle = {
    PaperProps: {
      sx: {
        backgroundColor: '#2A2A2A',
        color: '#FFF',
        '& .MuiMenuItem-root:hover': { backgroundColor: '#3A3A3A' },
        '& .Mui-selected': { backgroundColor: '#FFC107 !important', color: '#000 !important' }
      }
    }
  }

  return (
    <Box sx={{ backgroundColor: '#121212', minHeight: '100vh', color: '#FFFFFF', pt: 4, pb: 6 }}>
      <Container maxWidth="md">
        
        {/* Header Title */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, borderBottom: '2px solid #2A2A2A', pb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
            Penyelesaian <span style={{ color: '#FFC107' }}>Perbaikan</span> {preSelectedPol && `(${preSelectedPol})`}
          </Typography>
        </Box>

        {!formReady && (
          <Alert severity="info" sx={{ mb: 3, backgroundColor: '#0288d1', color: '#FFF', fontWeight: 'bold' }}>
            Silakan pilih kendaraan dari halaman 'Kendaraan' terlebih dahulu, lalu klik tombol 'Perbaiki'.
          </Alert>
        )}

        {/* Form Area Wrapper */}
        <Paper sx={{ backgroundColor: '#1E1E1E', p: 4, borderRadius: 3, boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.4)', mb: 4 }}>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
            <TextField
              label="Odometer Baru (Km)"
              value={odometerBaru}
              onChange={(e) => setOdometerBaru(e.target.value)}
              type="number"
              disabled={!formReady}
              sx={{ flex: 1, minWidth: '200px', ...darkTextFieldStyle }}
            />
            
            <TextField
              select
              label="Saring Suku Cadang Berdasarkan Kategori"
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              disabled={!formReady}
              sx={{ flex: 1, minWidth: '200px', ...darkTextFieldStyle }}
              SelectProps={menuPropsStyle}
            >
              {kategoriList.map((k) => (
                <MenuItem key={k} value={k}>{k}</MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Dinamis Suku Cadang Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#FFC107', fontWeight: 'bold', textTransform: 'uppercase' }}>
              Komponen yang Digunakan
            </Typography>
            <Button 
              variant="outlined" 
              onClick={addRow} 
              disabled={!formReady || (user?.role !== 'Kepala_Mekanik' && !assignedTask)}
              sx={{
                borderColor: '#FFC107',
                color: '#FFC107',
                textTransform: 'none',
                fontWeight: 'bold',
                borderRadius: 2,
                '&:hover': { borderColor: '#e0a800', backgroundColor: 'rgba(255,193,7,0.1)' }
              }}
            >
              + Tambah Komponen
            </Button>
          </Box>

          {/* Dynamic Rows Table */}
          <TableContainer component={Box} sx={{ backgroundColor: '#252525', borderRadius: 2, mb: 3 }}>
            <Table size="small">
              <TableBody>
                {rows.length > 0 ? (
                  rows.map((r, i) => (
                    <TableRow key={i} sx={{ '&:hover': { backgroundColor: '#2E2E2E' } }}>
                      
                      {/* Dropdown Suku Cadang */}
                      <TableCell sx={{ borderBottom: '1px solid #333', py: 1.5 }}>
                        <TextField
                          select
                          label="Pilih Komponen"
                          value={r.id_suku_cadang}
                          onChange={(e) => updateRow(i, 'id_suku_cadang', e.target.value)}
                          fullWidth
                          sx={darkTextFieldStyle}
                          SelectProps={menuPropsStyle}
                        >
                          {sukuList.map((s) => (
                            <MenuItem key={s.id_suku_cadang} value={s.id_suku_cadang}>
                              {s.nama} (Stok: {s.kuantitas_fisik})
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>

                      {/* Input Jumlah Kuantitas */}
                      <TableCell sx={{ borderBottom: '1px solid #333', width: '130px' }}>
                        <TextField
                          label="Jumlah"
                          type="number"
                          value={r.kuantitas_dipakai}
                          onChange={(e) => updateRow(i, 'kuantitas_dipakai', parseInt(e.target.value || 0, 10))}
                          sx={darkTextFieldStyle}
                        />
                      </TableCell>

                      {/* Tombol Aksi Delete */}
                      <TableCell sx={{ borderBottom: '1px solid #333', width: '90px' }} align="center">
                        <Button 
                          color="error" 
                          onClick={() => removeRow(i)}
                          sx={{ textTransform: 'none', fontWeight: 'bold' }}
                        >
                          Hapus
                        </Button>
                      </TableCell>

                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell align="center" sx={{ color: '#777', py: 4, border: 'none' }}>
                      Belum ada komponen tambahan yang dipilih.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {user?.role !== 'Kepala_Mekanik' && !assignedTask && formReady && (
            <Alert severity="warning" sx={{ mb: 3, backgroundColor: '#e65100', color: '#FFF' }}>
              Anda belum ditugaskan untuk menangani kendaraan ini. Tombol simpan dinonaktifkan otomatis.
            </Alert>
          )}

          {/* Form Action Submit */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={submit}
              disabled={!formReady || loading || (user?.role !== 'Kepala_Mekanik' && !assignedTask)}
              sx={{
                px: 4,
                py: 1.2,
                backgroundColor: '#FFC107',
                color: '#000',
                fontWeight: 'bold',
                textTransform: 'none',
                borderRadius: 2,
                boxShadow: '0px 4px 15px rgba(255, 193, 7, 0.3)',
                '&:hover': { backgroundColor: '#e0a800' },
                '&:disabled': { backgroundColor: '#444', color: '#888' }
              }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: '#000' }} /> : 'Simpan Penyelesaian'}
            </Button>
          </Box>
        </Paper>

        {/* Toast Notification */}
        <Snackbar
          open={toast.open}
          autoHideDuration={6000}
          onClose={() => setToast({ ...toast, open: false })}
        >
          <Alert 
            severity={toast.severity} 
            onClose={() => setToast({ ...toast, open: false })}
            sx={{ backgroundColor: toast.severity === 'success' ? '#1B5E20' : '#4A0000', color: '#FFF' }}
          >
            {toast.message}
          </Alert>
        </Snackbar>

      </Container>
    </Box>
  )
}