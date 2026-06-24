import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  TextField,
  MenuItem,
  Button,
  Table,
  TableHead,
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
import { useParams, useLocation } from 'react-router-dom'

export default function RepairForm({ user }) {
  const params = useParams()
  const location = useLocation()
  const preSelectedPol = params.nomor_polisi ? decodeURIComponent(params.nomor_polisi) : null
  const formReady = Boolean(preSelectedPol)
  const [kategoriList, setKategoriList] = useState([])
  const [selectedKategori, setSelectedKategori] = useState('')
  
  // STRUKTUR MAP: { nama_kategori: [ list_suku_cadang ] }
  const [sukuList, setSukuList] = useState({}) 
  
  // FLAT CACHE: Mengamankan nama & teks komponen lama agar tidak blank saat kategori di atas diubah
  const [allSukuCache, setAllSukuCache] = useState({})
  
  const [rows, setRows] = useState([])
  const [odometerBaru, setOdometerBaru] = useState('')
  const [assignedTask, setAssignedTask] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' })

  const catatanDariState = location.state?.catatan_kerusakan

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
    if (sukuList[kat]) return 
    
    setLoading(true)
    try {
      const items = await window.api.getSukuByKategori(kat)
      
      setSukuList(prev => ({
        ...prev,
        [kat]: items || []
      }))

      if (items && items.length > 0) {
        setAllSukuCache(prev => {
          const updated = { ...prev }
          items.forEach(item => {
            updated[item.id_suku_cadang] = item
          })
          return updated
        })
      }
    } catch (err) {
      console.error('Failed to load suku cadang', err)
      setToast({ open: true, message: 'Gagal memuat data suku cadang', severity: 'error' })
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
    const result = await Swal.fire({
      title: 'Hapus item?',
      text: 'Anda akan menghapus komponen ini dari transaksi.',
      icon: 'warning',
      background: '#1E1E1E',
      color: '#FFF',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#555',
      confirmButtonText: 'Ya, hapus',
      customClass: { input: 'swal-dark-select' },
      willOpen: () => {
        if (!document.getElementById('swal-dark-select-style')) {
          const style = document.createElement('style');
          style.id = 'swal-dark-select-style';
          style.innerHTML = `
            .swal-dark-select { color: #000000 !important; background-color: #FFFFFF !important; }
            .swal-dark-select option { color: #000000 !important; background-color: #FFFFFF !important; }
          `;
          document.head.appendChild(style);
        }
      }
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

      const sanitizedComponents = rows.map(r => ({
        id_suku_cadang: r.id_suku_cadang,
        kuantitas_dipakai: r.kuantitas_dipakai
      }))

      const payload = {
        id_log,
        odometer_baru: parseInt(odometerBaru, 10),
        components: sanitizedComponents
      }
      await window.api.completeRepair(payload)
      setToast({ open: true, message: 'Perbaikan selesai dan disimpan', severity: 'success' })
    } catch (err) {
      setToast({ open: true, message: err.message || String(err), severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

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
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, borderBottom: '2px solid #2A2A2A', pb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
            Form Penyelesaian Perbaikan <span style={{ color: '#FFC107' }}>{preSelectedPol ? `(${preSelectedPol})` : ''}</span>
          </Typography>
        </Box>

        {!formReady && (
          <Alert severity="info" sx={{ mb: 3, backgroundColor: '#0288d1', color: '#FFF', fontWeight: 'bold' }}>
            Silakan pilih kendaraan dari halaman Kendaraan lalu klik tombol Perbaiki untuk membuka form yang benar.
          </Alert>
        )}

        {formReady && (catatanDariState || assignedTask?.catatan_kerusakan) && (
          <Paper sx={{ backgroundColor: '#1E1E1E', p: 3, borderRadius: 3, mb: 3, boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.4)', borderLeft: '5px solid #FFC107' }}>
            <Typography variant="subtitle1" sx={{ color: '#FFC107', fontWeight: 'bold', mb: 1 }}>
              Catatan Kerusakan / Keluhan:
            </Typography>
            <Typography variant="body1" sx={{ color: '#FFF', lineHeight: 1.5 }}>
              {catatanDariState || assignedTask?.catatan_kerusakan}
            </Typography>
          </Paper>
        )}

        <Paper sx={{ backgroundColor: '#1E1E1E', p: 4, borderRadius: 3, boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.4)' }}>
          
          <Box sx={{ my: 2 }}>
            <TextField
              label="Odometer Baru"
              value={odometerBaru}
              onChange={(e) => setOdometerBaru(e.target.value)}
              type="number"
              disabled={!formReady}
              sx={{ minWidth: 240, ...darkTextFieldStyle }}
            />
          </Box>

          <Box sx={{ my: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              select
              label="Kategori"
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              disabled={!formReady}
              sx={{ minWidth: 240, ...darkTextFieldStyle }}
              SelectProps={menuPropsStyle}
            >
              {kategoriList.map((k) => (
                <MenuItem key={k} value={k}>
                  {k}
                </MenuItem>
              ))}
            </TextField>
            
            <Button 
              variant="outlined" 
              onClick={addRow} 
              disabled={!formReady || !selectedKategori || (user?.role !== 'Kepala_Mekanik' && !assignedTask)}
              sx={{
                borderColor: '#FFC107', color: '#FFC107', textTransform: 'none', fontWeight: 'bold', py: 1.2, px: 3, borderRadius: 2,
                '&:hover': { borderColor: '#e0a800', backgroundColor: 'rgba(255,193,7,0.1)' },
                '&:disabled': { borderColor: '#444', color: '#666' }
              }}
            >
              Tambah Komponen
            </Button>
          </Box>

          <TableContainer component={Box} sx={{ backgroundColor: '#252525', borderRadius: 2, mb: 3, overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#2A2A2A' }}>
                <TableRow>
                  <TableCell sx={{ color: '#FFC107', fontWeight: 'bold', borderBottom: '1px solid #333' }}>Komponen</TableCell>
                  <TableCell sx={{ color: '#FFC107', fontWeight: 'bold', borderBottom: '1px solid #333', width: '150px' }}>Kuantitas</TableCell>
                  <TableCell sx={{ color: '#FFC107', fontWeight: 'bold', borderBottom: '1px solid #333', width: '100px' }} align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length > 0 ? (
                  rows.map((r, i) => (
                    <TableRow key={i} sx={{ '&:hover': { backgroundColor: '#2E2E2E' } }}>
                      <TableCell sx={{ borderBottom: '1px solid #333', py: 2 }}>
                        <TextField
                          select
                          value={r.id_suku_cadang}
                          onChange={(e) => updateRow(i, 'id_suku_cadang', e.target.value)}
                          fullWidth
                          sx={darkTextFieldStyle}
                          SelectProps={menuPropsStyle}
                        >
                          {/* PENGAMAN RENDERING TEXT BARIS LAMA AGAR TIDAK BLANK SAAT KATEGORI UTAMA DIUBAH */}
                          {r.id_suku_cadang && allSukuCache[r.id_suku_cadang] && !(sukuList[selectedKategori] || []).some(s => String(s.id_suku_cadang) === String(r.id_suku_cadang)) && (
                            <MenuItem key={r.id_suku_cadang} value={r.id_suku_cadang}>
                              {allSukuCache[r.id_suku_cadang].nama} (stok: {allSukuCache[r.id_suku_cadang].kuantitas_fisik})
                            </MenuItem>
                          )}

                          {/* PERBAIKAN: List dropdown sekarang secara dinamis mengikuti selectedKategori yang sedang aktif */}
                          {(sukuList[selectedKategori] || []).map((s) => (
                            <MenuItem key={s.id_suku_cadang} value={s.id_suku_cadang}>
                              {s.nama} (stok: {s.kuantitas_fisik})
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #333' }}>
                        <TextField
                          type="number"
                          value={r.kuantitas_dipakai}
                          onChange={(e) => updateRow(i, 'kuantitas_dipakai', e.target.value)}
                          sx={darkTextFieldStyle}
                        />
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #333' }} align="center">
                        <Button color="error" onClick={() => removeRow(i)} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
                          Hapus
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell align="center" colSpan={3} sx={{ color: '#777', py: 4, border: 'none' }}>
                      Belum ada suku cadang yang dimasukkan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
      <Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Komponen</TableCell>
              <TableCell>Kuantitas</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                <TableCell>
                  <TextField
                    select
                    value={r.id_suku_cadang}
                    onChange={(e) => updateRow(i, 'id_suku_cadang', e.target.value)}
                  >
                    {sukuList.map((s) => (
                      <MenuItem key={s.id_suku_cadang} value={s.id_suku_cadang}>
                        {s.nama} (stok: {s.kuantitas_fisik})
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={r.kuantitas_dipakai}
                    onChange={(e) =>
                      updateRow(i, 'kuantitas_dipakai', parseInt(e.target.value || 0, 10))
                    }
                  />
                </TableCell>
                <TableCell>
                  <Button color="error" onClick={() => removeRow(i)}>
                    Hapus
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

          {user?.role !== 'Kepala_Mekanik' && !assignedTask && formReady ? (
            <Alert severity="warning" sx={{ mb: 3, backgroundColor: '#e65100', color: '#FFF' }}>
              Anda belum ditugaskan untuk kendaraan ini, sehingga tidak dapat menyelesaikan perbaikan.
            </Alert>
          ) : null}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={submit}
              disabled={!formReady || loading || (user?.role !== 'Kepala_Mekanik' && !assignedTask)}
              sx={{
                px: 4, py: 1.2, backgroundColor: '#FFC107', color: '#000', fontWeight: 'bold', textTransform: 'none', borderRadius: 2,
                boxShadow: '0px 4px 15px rgba(255, 193, 7, 0.3)',
                '&:hover': { backgroundColor: '#e0a800' },
                '&:disabled': { backgroundColor: '#444', color: '#888' }
              }}
            >
              {loading ? <CircularProgress size={20} sx={{ color: '#000' }} /> : 'Simpan Penyelesaian'}
            </Button>
          </Box>
        </Paper>

        <Snackbar open={toast.open} autoHideDuration={6000} onClose={() => setToast({ ...toast, open: false })}>
          <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} sx={{ backgroundColor: toast.severity === 'success' ? '#1B5E20' : '#4A0000', color: '#FFF' }}>
            {toast.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  )
}