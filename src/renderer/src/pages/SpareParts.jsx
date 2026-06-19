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

export default function SpareParts() {
  const [kategoriList, setKategoriList] = useState([])
  const [selectedKategori, setSelectedKategori] = useState('')
  const [sukuList, setSukuList] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ nama: '', kategori: '', kuantitas_fisik: 0, batas_minimum: 0 })
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' })

  useEffect(() => {
    loadCategories()
  }, [])

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

  const submit = async () => {
    if (!form.nama || !form.kategori)
      return setToast({ open: true, message: 'Isi nama dan kategori', severity: 'warning' })
    setLoading(true)
    try {
      await window.api.addSukuCadang(form)
      setToast({ open: true, message: 'Suku cadang ditambahkan', severity: 'success' })
      setForm({ nama: '', kategori: form.kategori, kuantitas_fisik: 0, batas_minimum: 0 })
      loadCategories()
      if (form.kategori) loadSuku(form.kategori)
    } catch (err) {
      setToast({ open: true, message: err.message || String(err), severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // Objek styling kustom Textfield Dark Mode
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

  // Objek styling komponen kertas dropdown item list
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
      <Container maxWidth="lg">
        
        {/* Header Title */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, borderBottom: '2px solid #2A2A2A', pb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
            Manajemen <span style={{ color: '#FFC107' }}>Suku Cadang</span>
          </Typography>
        </Box>

        {/* Form Tambah Suku Cadang */}
        <Paper sx={{ backgroundColor: '#1E1E1E', p: 3, borderRadius: 3, boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.3)', mb: 4 }}>
          <Typography variant="subtitle2" sx={{ color: '#FFC107', mb: 2, fontWeight: 'bold', textTransform: 'uppercase' }}>
            Tambah Suku Cadang Baru
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              label="Nama Komponen"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              sx={{ flex: 2, minWidth: '200px', ...darkTextFieldStyle }}
            />
            <TextField
              label="Kategori"
              value={form.kategori}
              onChange={(e) => setForm({ ...form, kategori: e.target.value })}
              sx={{ flex: 1, minWidth: '150px', ...darkTextFieldStyle }}
              select
              SelectProps={menuPropsStyle}
            >
              {kategoriList.map((k) => (
                <MenuItem key={k} value={k}>{k}</MenuItem>
              ))}
              {form.kategori && !kategoriList.includes(form.kategori) && (
                <MenuItem value={form.kategori}>{form.kategori}</MenuItem>
              )}
            </TextField>
            <TextField
              label="Stok Utama"
              type="number"
              value={form.kuantitas_fisik}
              onChange={(e) => setForm({ ...form, kuantitas_fisik: parseInt(e.target.value || 0, 10) })}
              sx={{ width: 110, ...darkTextFieldStyle }}
            />
            <TextField
              label="Batas Min"
              type="number"
              value={form.batas_minimum}
              onChange={(e) => setForm({ ...form, batas_minimum: parseInt(e.target.value || 0, 10) })}
              sx={{ width: 110, ...darkTextFieldStyle }}
            />
            <Button 
              variant="contained" 
              onClick={submit} 
              disabled={loading}
              sx={{
                height: 56,
                px: 4,
                backgroundColor: '#FFC107',
                color: '#000000',
                fontWeight: 'bold',
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0px 4px 15px rgba(255, 193, 7, 0.2)',
                '&:hover': { backgroundColor: '#e0a800' },
                '&:disabled': { backgroundColor: '#555', color: '#888' }
              }}
            >
              {loading ? <CircularProgress size={20} sx={{ color: '#000' }} /> : 'Tambah'}
            </Button>
          </Box>
        </Paper>

        {/* Filter Bagian */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-start' }}>
          <TextField
            select
            label="Saring Berdasarkan Kategori"
            value={selectedKategori}
            onChange={(e) => {
              setSelectedKategori(e.target.value)
              loadSuku(e.target.value)
            }}
            sx={{ width: 320, ...darkTextFieldStyle }}
            SelectProps={menuPropsStyle}
          >
            <MenuItem value="">-- Tampilkan Semua Kategori --</MenuItem>
            {kategoriList.map((k) => (
              <MenuItem key={k} value={k}>{k}</MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Tabel List Suku Cadang */}
        {loading && sukuList.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress sx={{ color: '#FFC107' }} />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ backgroundColor: '#1E1E1E', borderRadius: 3, boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.3)', overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#2A2A2A' }}>
                <TableRow>
                  {['Nama Komponen', 'Kategori', 'Stok Tersedia', 'Batas Minimum'].map((header) => (
                    <TableCell key={header} sx={{ color: '#FFC107', fontWeight: 'bold', borderBottom: '1px solid #333' }}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sukuList.length > 0 ? (
                  sukuList.map((s) => {
                    const isDefisit = s.kuantitas_fisik <= s.batas_minimum;
                    return (
                      <TableRow key={s.id_suku_cadang} sx={{ '&:hover': { backgroundColor: '#252525' } }}>
                        <TableCell sx={{ color: '#FFF', borderBottom: '1px solid #2A2A2A', fontWeight: 600 }}>{s.nama}</TableCell>
                        <TableCell sx={{ color: '#AAA', borderBottom: '1px solid #2A2A2A' }}>{selectedKategori || s.kategori || '-'}</TableCell>
                        <TableCell sx={{ 
                          borderBottom: '1px solid #2A2A2A', 
                          color: isDefisit ? '#FF5252' : '#4CAF50', 
                          fontWeight: 'bold' 
                        }}>
                          {s.kuantitas_fisik} Pcs {isDefisit && '(Kritis)'}
                        </TableCell>
                        <TableCell sx={{ color: '#AAA', borderBottom: '1px solid #2A2A2A' }}>{s.batas_minimum} Pcs</TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ color: '#888', py: 4, border: 'none' }}>
                      Tidak ada data suku cadang. Silakan pilih atau tambah kategori terlebih dahulu.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Toast Notifikasi */}
        <Snackbar
          open={toast.open}
          autoHideDuration={6000}
          onClose={() => setToast({ ...toast, open: false })}
        >
          <Alert 
            severity={toast.severity} 
            onClose={() => setToast({ ...toast, open: false })}
            sx={{ 
              backgroundColor: toast.severity === 'success' ? '#1B5E20' : toast.severity === 'warning' ? '#E65100' : '#4A0000', 
              color: '#FFF' 
            }}
          >
            {toast.message}
          </Alert>
        </Snackbar>

      </Container>
    </Box>
  )
}