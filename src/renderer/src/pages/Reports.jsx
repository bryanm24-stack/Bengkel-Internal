import React, { useState, useEffect, useRef } from 'react'
import { 
  Container, Typography, Box, Paper, Button, CircularProgress, 
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Tabs, Tab
} from '@mui/material'
import Chart from 'chart.js/auto'
import { useNavigate } from 'react-router-dom'

export default function Reports({ user }) {
  const [reportsData, setReportsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0) // 0: Kesiapan, 1: Defisit, 2: Frekuensi, 3: Penugasan, 4: Konsumsi
  const [viewMode, setViewMode] = useState('table') // 'table' atau 'chart'
  
  const chartRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await window.api.getReports()
      setReportsData(data)
    } catch (err) {
      console.error('Failed to load reports:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fungsi untuk memanggil IPC Print PDF di main process
  const handlePrint = () => {
    window.api.printPDF()
  }

  // Effect untuk menggambar ulang grafik saat tab atau mode view berubah
  useEffect(() => {
    if (viewMode === 'chart' && reportsData) {
      renderChart()
    }
    
    // Cleanup saat unmount atau pindah ke mode tabel
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = null
      }
    }
  }, [activeTab, viewMode, reportsData])

  const renderChart = () => {
    const canvasElement = document.getElementById('reportCanvas')
    if (!canvasElement) return

    if (chartRef.current) {
      chartRef.current.destroy()
    }

    let type = 'bar'
    let data = {}
    let options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#FFF' } } },
      scales: {
        x: { ticks: { color: '#AAA' }, grid: { color: '#333' } },
        y: { ticks: { color: '#AAA' }, grid: { color: '#333' }, beginAtZero: true }
      }
    }

    // Konfigurasi data berdasarkan Tab yang aktif
    if (activeTab === 0) { // Kesiapan Armada
      const rd = reportsData.kesiapan_armada[0] || { aktif_count: 0, diperbaiki_count: 0 }
      type = 'pie'
      data = {
        labels: ['Aktif', 'Diperbaiki'],
        datasets: [{
          data: [rd.aktif_count, rd.diperbaiki_count],
          backgroundColor: ['#4CAF50', '#FFC107'],
          borderWidth: 0
        }]
      }
      options.scales = {} // Pie chart tidak butuh grid XY
    } 
    else if (activeTab === 1) { // Defisit Inventaris
      type = 'bar'
      data = {
        labels: reportsData.defisit_inventaris.map(d => d.nama),
        datasets: [
          {
            label: 'Kuantitas Fisik',
            data: reportsData.defisit_inventaris.map(d => d.kuantitas_fisik),
            backgroundColor: '#FF5252'
          },
          {
            label: 'Batas Minimum',
            data: reportsData.defisit_inventaris.map(d => d.batas_minimum),
            backgroundColor: '#FFC107'
          }
        ]
      }
    } 
    else if (activeTab === 2) { // Frekuensi Kerusakan
      type = 'bar'
      data = {
        labels: reportsData.frekuensi_kerusakan.map(d => d.nomor_polisi),
        datasets: [{
          label: 'Jumlah Kerusakan',
          data: reportsData.frekuensi_kerusakan.map(d => d.jumlah_kerusakan),
          backgroundColor: '#2196F3'
        }]
      }
    } 
    else if (activeTab === 3) { // Distribusi Penugasan
      type = 'doughnut'
      data = {
        labels: reportsData.distribusi_penugasan.map(d => `ID Mekanik: ${d.id_mekanik}`),
        datasets: [{
          data: reportsData.distribusi_penugasan.map(d => d.jumlah_penugasan),
          backgroundColor: ['#FFC107', '#2196F3', '#4CAF50', '#9C27B0', '#FF5722'],
          borderWidth: 0
        }]
      }
      options.scales = {} 
    } 
    else if (activeTab === 4) { // Konsumsi Komponen
      type = 'bar'
      data = {
        labels: reportsData.konsumsi_komponen.map(d => d.nama_suku_cadang),
        datasets: [{
          label: 'Total Dipakai',
          data: reportsData.konsumsi_komponen.map(d => d.total_dipakai),
          backgroundColor: '#9C27B0'
        }]
      }
      options.indexAxis = 'y' // Horizontal bar chart agar nama komponen panjang terbaca
    }

    chartRef.current = new Chart(canvasElement, { type, data, options })
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const renderTableContent = () => {
    if (!reportsData) return null

    const cellStyle = { color: '#FFF', borderBottom: '1px solid #333' }
    const headStyle = { color: '#FFC107', fontWeight: 'bold', borderBottom: '2px solid #555' }

    if (activeTab === 0) {
      return (
        <Table>
          <TableHead><TableRow>
            <TableCell sx={headStyle}>Total Kendaraan</TableCell>
            <TableCell sx={headStyle}>Aktif</TableCell>
            <TableCell sx={headStyle}>Diperbaiki</TableCell>
            <TableCell sx={headStyle}>% Aktif</TableCell>
            <TableCell sx={headStyle}>% Diperbaiki</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {reportsData.kesiapan_armada.map((row, i) => (
              <TableRow key={i}>
                <TableCell sx={cellStyle}>{row.total}</TableCell>
                <TableCell sx={{...cellStyle, color: '#4CAF50'}}>{row.aktif_count}</TableCell>
                <TableCell sx={{...cellStyle, color: '#FFC107'}}>{row.diperbaiki_count}</TableCell>
                <TableCell sx={cellStyle}>{row.pct_aktif}%</TableCell>
                <TableCell sx={cellStyle}>{row.pct_diperbaiki}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )
    }
    if (activeTab === 1) {
      return (
        <Table>
          <TableHead><TableRow>
            <TableCell sx={headStyle}>Nama Suku Cadang</TableCell>
            <TableCell sx={headStyle}>Kategori</TableCell>
            <TableCell sx={headStyle}>Kuantitas Fisik</TableCell>
            <TableCell sx={headStyle}>Batas Minimum</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {reportsData.defisit_inventaris.map((row, i) => (
              <TableRow key={i}>
                <TableCell sx={cellStyle}>{row.nama}</TableCell>
                <TableCell sx={cellStyle}>{row.kategori}</TableCell>
                <TableCell sx={{...cellStyle, color: '#FF5252', fontWeight: 'bold'}}>{row.kuantitas_fisik}</TableCell>
                <TableCell sx={cellStyle}>{row.batas_minimum}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )
    }
    if (activeTab === 2) {
      return (
        <Table>
          <TableHead><TableRow>
            <TableCell sx={headStyle}>Nomor Polisi</TableCell>
            <TableCell sx={headStyle}>Jumlah Kerusakan (Log)</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {reportsData.frekuensi_kerusakan.map((row, i) => (
              <TableRow key={i}>
                <TableCell sx={cellStyle}>{row.nomor_polisi}</TableCell>
                <TableCell sx={cellStyle}>{row.jumlah_kerusakan} kali</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )
    }
    if (activeTab === 3) {
      return (
        <Table>
          <TableHead><TableRow>
            <TableCell sx={headStyle}>ID Mekanik</TableCell>
            <TableCell sx={headStyle}>Total Penugasan Selesai/Aktif</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {reportsData.distribusi_penugasan.map((row, i) => (
              <TableRow key={i}>
                <TableCell sx={cellStyle}>Mekanik #{row.id_mekanik}</TableCell>
                <TableCell sx={cellStyle}>{row.jumlah_penugasan} penugasan</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )
    }
    if (activeTab === 4) {
      return (
        <Table>
          <TableHead><TableRow>
            <TableCell sx={headStyle}>Nama Komponen</TableCell>
            <TableCell sx={headStyle}>Total Kuantitas Dipakai</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {reportsData.konsumsi_komponen.map((row, i) => (
              <TableRow key={i}>
                <TableCell sx={cellStyle}>{row.nama_suku_cadang}</TableCell>
                <TableCell sx={cellStyle}>{row.total_dipakai} unit</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )
    }
  }

  const tabStyle = { color: '#AAA', fontWeight: 'bold', '&.Mui-selected': { color: '#FFC107' } }

  return (
    <Box sx={{ backgroundColor: '#121212', minHeight: '100vh', color: '#FFFFFF', pt: 4, pb: 6 }}>
      <Container maxWidth="lg">
        
        {/* Header Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, borderBottom: '2px solid #2A2A2A', pb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Laporan <span style={{ color: '#FFC107' }}>Performa Bengkel</span>
          </Typography>
          
          {/* Actions: Print dan Kembali (Diberi class no-print agar tidak ikut ter-PDF kan) */}
          <Box className="no-print" sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              onClick={handlePrint}
              sx={{ backgroundColor: '#ff9800', color: '#000', fontWeight: 'bold', '&:hover': { backgroundColor: '#e68a00' } }}
            >
              Cetak PDF
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => navigate(-1)}
              sx={{ color: '#AAA', borderColor: '#555', '&:hover': { borderColor: '#FFF', color: '#FFF' } }}
            >
              Kembali
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
            <CircularProgress sx={{ color: '#FFC107' }} />
          </Box>
        ) : (
          <Paper sx={{ backgroundColor: '#1E1E1E', borderRadius: 3, overflow: 'hidden', boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.4)' }}>
            
            {/* Tabs Navigation (Diberi class no-print) */}
            <Box className="no-print" sx={{ borderBottom: 1, borderColor: '#333', backgroundColor: '#252525' }}>
              <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" TabIndicatorProps={{ style: { backgroundColor: '#FFC107' } }}>
                <Tab label="Kesiapan Armada" sx={tabStyle} />
                <Tab label="Defisit Inventaris" sx={tabStyle} />
                <Tab label="Frekuensi Kerusakan" sx={tabStyle} />
                <Tab label="Kinerja Mekanik" sx={tabStyle} />
                <Tab label="Konsumsi Komponen" sx={tabStyle} />
              </Tabs>
            </Box>

            {/* Content Area */}
            <Box sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h6" sx={{ color: '#FFF' }}>
                  {activeTab === 0 && "Statistik Kesiapan Operasional Armada"}
                  {activeTab === 1 && "Daftar Suku Cadang di Bawah Batas Minimum"}
                  {activeTab === 2 && "Aset Kendaraan Paling Sering Rusak"}
                  {activeTab === 3 && "Beban Kerja & Distribusi Penugasan Mekanik"}
                  {activeTab === 4 && "Suku Cadang Paling Sering Digunakan"}
                </Typography>

                {/* Tombol Toggle View (Diberi class no-print) */}
                <Button 
                  className="no-print"
                  variant="contained" 
                  onClick={() => setViewMode(viewMode === 'table' ? 'chart' : 'table')}
                  sx={{ 
                    backgroundColor: viewMode === 'table' ? '#FFC107' : '#4CAF50', 
                    color: '#000', fontWeight: 'bold', textTransform: 'none',
                    '&:hover': { backgroundColor: viewMode === 'table' ? '#e0a800' : '#388E3C' }
                  }}
                >
                  {viewMode === 'table' ? 'Lihat Grafik' : 'Lihat Tabel'}
                </Button>
              </Box>

              {/* Dynamic Render: Table or Chart */}
              {viewMode === 'table' ? (
                <TableContainer>
                  {renderTableContent()}
                </TableContainer>
              ) : (
                <Box sx={{ width: '100%', height: '400px', p: 2, backgroundColor: '#252525', borderRadius: 2 }}>
                  <canvas id="reportCanvas"></canvas>
                </Box>
              )}
            </Box>
            
          </Paper>
        )}

      </Container>
    </Box>
  )
}