import React from 'react'
import { Container, Typography, Box, Paper, Grid } from '@mui/material'

export default function MekanikDashboard({ user }) {
  return (
    <Box sx={{ backgroundColor: '#121212', minHeight: '100vh', color: '#FFFFFF', pt: 4, pb: 6 }}>
      <Container maxWidth="lg">
        
        {/* Header Title */}
        <Box sx={{ mb: 4, borderBottom: '2px solid #2A2A2A', pb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
            Dashboard <span style={{ color: '#FFC107' }}>Mekanik</span>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: '#AAAAAA' }}>
            Selamat datang kembali, <span style={{ color: '#FFF', fontWeight: 'bold' }}>{user?.nama || user?.username}</span>. (Akses: {user?.role})
          </Typography>
        </Box>

        {/* Informasi Utama Panel */}
        <Grid container spacing={3}>
          
          {/* Card Panduan Utama */}
          <Grid item xs={12} md={8}>
            <Paper 
              sx={{ 
                backgroundColor: '#1E1E1E', 
                p: 3, 
                borderRadius: 3, 
                boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.3)',
                borderLeft: '5px solid #FFC107'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#FFC107', mb: 1.5 }}>
                Petunjuk Penugasan
              </Typography>
              <Typography variant="body1" sx={{ color: '#E0E0E0', lineHeight: 1.6 }}>
                Untuk memulai penanganan kendala atau perbaikan armada baru, silakan buka menu 
                <span style={{ color: '#FFC107', fontWeight: 'bold' }}> Kendaraan </span> 
                pada navigasi di atas, lalu pilih unit armada yang sedang masuk dalam status perbaikan.
              </Typography>
            </Paper>
          </Grid>

          {/* Card Ringkasan Fitur */}
          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                backgroundColor: '#1E1E1E', 
                p: 3, 
                borderRadius: 3, 
                boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.3)'
              }}
            >
              <Typography variant="subtitle2" sx={{ color: '#AAA', fontWeight: 'bold', textTransform: 'uppercase', mb: 2 }}>
                Akses Fitur Anda
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#4CAF50' }} />
                  <Typography variant="body2" sx={{ color: '#DDD' }}>Melihat daftar tugas aktif</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#FFC107' }} />
                  <Typography variant="body2" sx={{ color: '#DDD' }}>Perbarui status tugas mandiri</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#2196F3' }} />
                  <Typography variant="body2" sx={{ color: '#DDD' }}>Pencatatan konsumsi komponen</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

        </Grid>

      </Container>
    </Box>
  )
}