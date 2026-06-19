import React from 'react'
import { Container, Typography, Button, Box, Paper } from '@mui/material'
import { Link } from 'react-router-dom'

export default function KepalaDashboard({ user }) {
  return (
    <Box sx={{ backgroundColor: '#121212', minHeight: '100vh', color: '#FFFFFF', pt: 4, pb: 6 }}>
      <Container maxWidth="md">
        
        {/* Header Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, borderBottom: '2px solid #2A2A2A', pb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
            Dashboard <span style={{ color: '#FFC107' }}>Kepala Montir</span>
          </Typography>
        </Box>

        {/* Welcome Card */}
        <Paper 
          sx={{ 
            backgroundColor: '#1E1E1E', 
            p: 4, 
            borderRadius: 3, 
            boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.4)',
            borderLeft: '5px solid #FFC107',
            mb: 4
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#FFF' }}>
            Selamat datang, <span style={{ color: '#FFC107' }}>{user?.nama || user?.username}</span>
          </Typography>
          <Typography variant="body2" sx={{ color: '#AAAAAA', mt: 0.5 }}>
            Hak Akses Sistem: <strong style={{ color: '#FFF' }}>{user?.role}</strong>
          </Typography>
          
          <Typography sx={{ mt: 3, color: '#CCCCCC', lineHeight: 1.6 }}>
            Sebagai Kepala Montir, Anda memiliki otoritas penuh untuk memantau performa bengkel, mengakses laporan berkala, manajemen inventaris, serta melakukan pengelolaan data master kendaraan.
          </Typography>
        </Paper>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            component={Link} 
            to="/reports" 
            variant="contained"
            sx={{ 
              py: 1.2,
              px: 3,
              backgroundColor: '#FFC107', 
              color: '#000000',
              fontWeight: 'bold',
              borderRadius: 2,
              textTransform: 'none',
              boxShadow: '0px 4px 15px rgba(255, 193, 7, 0.2)',
              '&:hover': { 
                backgroundColor: '#e0a800',
                boxShadow: '0px 6px 20px rgba(255, 193, 7, 0.4)',
              }
            }}
          >
            Lihat Laporan
          </Button>
          
          <Button 
            component={Link} 
            to="/" 
            variant="outlined"
            sx={{ 
              py: 1.2,
              px: 3,
              borderColor: '#FFC107', 
              color: '#FFC107',
              fontWeight: 'bold',
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': { 
                borderColor: '#e0a800',
                backgroundColor: 'rgba(255, 193, 7, 0.08)',
              }
            }}
          >
            Kelola Kendaraan
          </Button>
        </Box>

      </Container>
    </Box>
  )
}