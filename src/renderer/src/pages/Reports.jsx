import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  CircularProgress,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  Snackbar,
  Alert
} from '@mui/material'

export default function Reports() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const r = await window.api.getReports()
      setData(r)
    } finally {
      setLoading(false)
    }
  }

  const handlePrintPdf = async () => {
    try {
      const result = await window.api.printPDF()
      if (result?.success) {
        setToast({ open: true, message: `PDF tersimpan ke ${result.path}`, severity: 'success' })
      } else if (result?.canceled) {
        setToast({ open: true, message: 'Cetak PDF dibatalkan', severity: 'info' })
      } else {
        setToast({ open: true, message: result?.error || 'Gagal membuat PDF', severity: 'error' })
      }
    } catch (err) {
      setToast({ open: true, message: err.message || 'Error saat mencetak PDF', severity: 'error' })
    }
  }

  if (loading)
    return (
      <Box sx={{ backgroundColor: '#121212', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#FFC107' }} />
      </Box>
    )

  const kesiapan =
    Array.isArray(data?.kesiapan_kendaraan) && data.kesiapan_kendaraan[0] ? data.kesiapan_kendaraan[0] : null

  // reusable style untuk card box
  const cardStyle = {
    mt: 3,
    backgroundColor: '#1E1E1E',
    borderRadius: 3,
    boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.3)',
    border: 'none',
    overflow: 'hidden'
  }

  const tableHeadStyle = {
    backgroundColor: '#2A2A2A'
  }

  const headerCellStyle = {
    color: '#FFC107',
    fontWeight: 'bold',
    borderBottom: '1px solid #333'
  }

  const bodyCellStyle = {
    color: '#FFF',
    borderBottom: '1px solid #2A2A2A'
  }

  return (
    <Box sx={{ 
      backgroundColor: '#121212', 
      minHeight: '100vh', 
      color: '#FFFFFF', 
      pt: 4, 
      pb: 6,
      // CSS khusus untuk mode cetak printer / PDF generator
      '@media print': {
        backgroundColor: '#FFF !important',
        color: '#000 !important',
        '.no-print': { display: 'none !important' },
        '.MuiPaper-root': { backgroundColor: '#FFF !important', color: '#000 !important', boxShadow: 'none !important' },
        '.MuiTableCell-root': { color: '#000 !important', borderColor: '#DDD !important' },
        '.MuiTableHead-root': { backgroundColor: '#EEE !important' },
        '.report-title': { color: '#000 !important' }
      }
    }}>
      <Container className="report-print-area" maxWidth="lg">
        
        {/* Header Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, borderBottom: '2px solid #2A2A2A', pb: 2 }}>
          <Typography variant="h5" className="report-title" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
            Laporan <span style={{ color: '#FFC107' }} className="report-title">Sistem Bengkel</span>
          </Typography>
          <Button 
            className="no-print" 
            variant="contained" 
            onClick={handlePrintPdf}
            sx={{
              backgroundColor: '#FFC107',
              color: '#000',
              fontWeight: 'bold',
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              boxShadow: '0px 4px 15px rgba(255, 193, 7, 0.3)',
              '&:hover': { backgroundColor: '#e0a800' }
            }}
          >
            Cetak PDF
          </Button>
        </Box>

        {/* 1. Kesiapan Kendaraan */}
        <Box sx={cardStyle} component={Paper}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#FFC107', mb: 2 }}>Kesiapan Kendaraan</Typography>
            {kesiapan ? (
              <Table size="small">
                <TableHead sx={tableHeadStyle}>
                  <TableRow>
                    <TableCell sx={headerCellStyle}>Indikator</TableCell>
                    <TableCell sx={headerCellStyle}>Nilai / Jumlah</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow sx={{ '&:hover': { backgroundColor: '#252525' } }}>
                    <TableCell sx={bodyCellStyle}>Aktif</TableCell>
                    <TableCell sx={{ ...bodyCellStyle, color: '#4CAF50', fontWeight: 'bold' }}>{kesiapan.aktif_count} Unit</TableCell>
                  </TableRow>
                  <TableRow sx={{ '&:hover': { backgroundColor: '#252525' } }}>
                    <TableCell sx={bodyCellStyle}>Diperbaiki</TableCell>
                    <TableCell sx={{ ...bodyCellStyle, color: '#FFC107', fontWeight: 'bold' }}>{kesiapan.diperbaiki_count} Unit</TableCell>
                  </TableRow>
                  <TableRow sx={{ '&:hover': { backgroundColor: '#252525' } }}>
                    <TableCell sx={bodyCellStyle}>Total Armada</TableCell>
                    <TableCell sx={bodyCellStyle}>{kesiapan.total} Unit</TableCell>
                  </TableRow>
                  <TableRow sx={{ '&:hover': { backgroundColor: '#252525' } }}>
                    <TableCell sx={bodyCellStyle}>% Aktif</TableCell>
                    <TableCell sx={bodyCellStyle}>{kesiapan.pct_aktif}%</TableCell>
                  </TableRow>
                  <TableRow sx={{ '&:hover': { backgroundColor: '#252525' } }}>
                    <TableCell sx={bodyCellStyle}>% Diperbaiki</TableCell>
                    <TableCell sx={bodyCellStyle}>{kesiapan.pct_diperbaiki}%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <Typography sx={{ color: '#AAAAAA' }}>Tidak ada data kesiapan kendaraan.</Typography>
            )}
          </Box>
        </Box>

        {/* 2. Defisit Inventaris */}
        <Box sx={cardStyle} component={Paper}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#FFC107', mb: 2 }}>Defisit Inventaris</Typography>
            {Array.isArray(data?.defisit_inventaris) && data.defisit_inventaris.length > 0 ? (
              <Table size="small">
                <TableHead sx={tableHeadStyle}>
                  <TableRow>
                    {['ID', 'Nama Suku Cadang', 'Kategori', 'Stok Fisik', 'Batas Minimum'].map((h) => (
                      <TableCell key={h} sx={headerCellStyle}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.defisit_inventaris.map((r) => (
                    <TableRow key={r.id_suku_cadang} sx={{ '&:hover': { backgroundColor: '#252525' } }}>
                      <TableCell sx={bodyCellStyle}>{r.id_suku_cadang}</TableCell>
                      <TableCell sx={bodyCellStyle}>{r.nama}</TableCell>
                      <TableCell sx={bodyCellStyle}>{r.kategori}</TableCell>
                      <TableCell sx={{ ...bodyCellStyle, color: '#f44336', fontWeight: 'bold' }}>{r.kuantitas_fisik}</TableCell>
                      <TableCell sx={bodyCellStyle}>{r.batas_minimum}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography sx={{ color: '#AAAAAA' }}>
                Tidak ada suku cadang mendekati atau di bawah batas minimum.
              </Typography>
            )}
          </Box>
        </Box>

        {/* 3. Frekuensi Kerusakan */}
        <Box sx={cardStyle} component={Paper}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#FFC107', mb: 2 }}>Frekuensi Kerusakan Utama</Typography>
            {Array.isArray(data?.frekuensi_kerusakan) && data.frekuensi_kerusakan.length > 0 ? (
              <Table size="small">
                <TableHead sx={tableHeadStyle}>
                  <TableRow>
                    <TableCell sx={headerCellStyle}>Nomor Polisi</TableCell>
                    <TableCell sx={headerCellStyle}>Jumlah Kasus Kerusakan</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.frekuensi_kerusakan.map((r) => (
                    <TableRow key={r.nomor_polisi} sx={{ '&:hover': { backgroundColor: '#252525' } }}>
                      <TableCell sx={bodyCellStyle}>{r.nomor_polisi}</TableCell>
                      <TableCell sx={bodyCellStyle}>{r.jumlah_kerusakan} Kali</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography sx={{ color: '#AAAAAA' }}>Tidak ada data kerusakan.</Typography>
            )}
          </Box>
        </Box>

        {/* 4. Distribusi Penugasan */}
        <Box sx={cardStyle} component={Paper}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#FFC107', mb: 2 }}>Distribusi Penugasan Mekanik</Typography>
            {Array.isArray(data?.distribusi_penugasan) && data.distribusi_penugasan.length > 0 ? (
              <Table size="small">
                <TableHead sx={tableHeadStyle}>
                  <TableRow>
                    <TableCell sx={headerCellStyle}>ID Mekanik</TableCell>
                    <TableCell sx={headerCellStyle}>Jumlah Penugasan</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.distribusi_penugasan.map((r) => (
                    <TableRow key={r.id_mekanik} sx={{ '&:hover': { backgroundColor: '#252525' } }}>
                      <TableCell sx={bodyCellStyle}>ID: {r.id_mekanik}</TableCell>
                      <TableCell sx={bodyCellStyle}>{r.jumlah_penugasan} Tugas</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography sx={{ color: '#AAAAAA' }}>Tidak ada distribusi penugasan.</Typography>
            )}
          </Box>
        </Box>

        {/* 5. Konsumsi Komponen */}
        <Box sx={cardStyle} component={Paper}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#FFC107', mb: 2 }}>Konsumsi Komponen / Sparepart</Typography>
            {Array.isArray(data?.konsumsi_komponen) && data.konsumsi_komponen.length > 0 ? (
              <Table size="small">
                <TableHead sx={tableHeadStyle}>
                  <TableRow>
                    <TableCell sx={headerCellStyle}>ID Suku</TableCell>
                    <TableCell sx={headerCellStyle}>Nama Komponen</TableCell>
                    <TableCell sx={headerCellStyle}>Total Terpakai</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.konsumsi_komponen.map((r) => (
                    <TableRow key={r.id_suku_cadang} sx={{ '&:hover': { backgroundColor: '#252525' } }}>
                      <TableCell sx={bodyCellStyle}>{r.id_suku_cadang}</TableCell>
                      <TableCell sx={bodyCellStyle}>{r.nama_suku_cadang}</TableCell>
                      <TableCell sx={bodyCellStyle}>{r.total_dipakai} Pcs</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography sx={{ color: '#AAAAAA' }}>Tidak ada data konsumsi komponen.</Typography>
            )}
          </Box>
        </Box>

        {/* Toast Notification */}
        <Snackbar
          className="no-print"
          open={toast.open}
          autoHideDuration={6000}
          onClose={() => setToast({ ...toast, open: false })}
        >
          <Alert 
            severity={toast.severity} 
            onClose={() => setToast({ ...toast, open: false })}
            sx={{ backgroundColor: toast.severity === 'error' ? '#4a0000' : '#1e1e1e', color: '#FFF' }}
          >
            {toast.message}
          </Alert>
        </Snackbar>

      </Container>
    </Box>
  )
}