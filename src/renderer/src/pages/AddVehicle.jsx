import React, { useState } from 'react'
import { Container, Typography, Box, TextField, Button, Snackbar, Alert, Paper } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function AddVehicle() {
  const [form, setForm] = useState({ nomor_polisi: '', tahun: '', odometer: 0, status: 'Aktif' })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' })
  const navigate = useNavigate()

  const submit = async () => {
    if (!form.nomor_polisi)
      return setToast({ open: true, message: 'Nomor polisi harus diisi', severity: 'warning' })
    setLoading(true)
    try {
      await window.api.addKendaraan(form)
      setToast({ open: true, message: 'Kendaraan berhasil ditambahkan', severity: 'success' })
      setTimeout(() => navigate('/'), 700)
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
    }
  }

  return (
    <Box sx={{ backgroundColor: '#121212', minHeight: '100vh', color: '#FFFFFF', pt: 4, pb: 6 }}>
      <Container maxWidth="sm">
        
        {/* Header Title */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, borderBottom: '2px solid #2A2A2A', pb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
            Tambah <span style={{ color: '#FFC107' }}>Kendaraan</span>
          </Typography>
        </Box>

        {/* Card Form Box */}
        <Paper 
          sx={{ 
            backgroundColor: '#1E1E1E', 
            p: 4, 
            borderRadius: 3, 
            boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.4)',
            borderTop: '5px solid #FFC107'
          }}
        >
          <Typography variant="body2" sx={{ mb: 3, color: '#AAAAAA' }}>
            Masukkan detail data armada operasional baru di bawah ini.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Nomor Polisi"
              placeholder="Contoh: B 1234 ABC"
              value={form.nomor_polisi}
              onChange={(e) => setForm({ ...form, nomor_polisi: e.target.value.toUpperCase() })}
              sx={darkTextFieldStyle}
              fullWidth
            />
            <TextField
              label="Tahun Pembuatan"
              type="number"
              value={form.tahun}
              onChange={(e) => setForm({ ...form, tahun: e.target.value })}
              sx={darkTextFieldStyle}
              fullWidth
            />
            <TextField
              label="Odometer Utama (Km)"
              type="number"
              value={form.odometer}
              onChange={(e) => setForm({ ...form, odometer: parseInt(e.target.value || 0, 10) })}
              sx={darkTextFieldStyle}
              fullWidth
            />

            {/* Actions Button */}
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button 
                variant="contained" 
                onClick={submit} 
                disabled={loading}
                sx={{ 
                  flex: 1,
                  py: 1.5,
                  backgroundColor: '#FFC107', 
                  color: '#000000',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: '0px 4px 15px rgba(255, 193, 7, 0.2)',
                  '&:hover': { 
                    backgroundColor: '#e0a800',
                  },
                  '&:disabled': {
                    backgroundColor: '#555',
                    color: '#888'
                  }
                }}
              >
                {loading ? 'Menyimpan...' : 'Simpan'}
              </Button>
              
              <Button 
                variant="outlined"
                onClick={() => navigate(-1)}
                sx={{ 
                  px: 3,
                  borderColor: '#555', 
                  color: '#AAAAAA',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': { 
                    borderColor: '#888',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#FFF'
                  }
                }}
              >
                Batal
              </Button>
            </Box>
          </Box>
        </Paper>

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