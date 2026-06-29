import mysql from 'mysql2/promise'
import fs from 'fs' 
import dotenv from 'dotenv'

dotenv.config()
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT, 
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  charset: 'utf8mb4_general_ci', 
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: {
    ca: fs.readFileSync('./ca.pem') 
  }
})

// ==========================================
// MAINTENANCE SYSTEM METHODS
// ==========================================

export const completeRepair = async (event, payload) => {
  // 💡 PERBAIKAN: Menambahkan odometer_baru sesuai parameter SP_SelesaikanPerbaikan terbaru
  const { id_log, odometer_baru, components } = payload
  const compJson = JSON.stringify(components || [])
  try {
    const [rows] = await pool.query('CALL SP_SelesaikanPerbaikan(?,?,?)', [
      id_log,
      odometer_baru || 0,
      compJson
    ])
    return { success: true }
  } catch (err) {
    throw new Error(err.sqlMessage || err.message || 'Database error')
  }
}

export const getKendaraan = async () => {
  const [resultSets] = await pool.query('CALL SP_GetKendaraan()')
  return Array.isArray(resultSets) && Array.isArray(resultSets[0]) ? resultSets[0] : resultSets
}

export const getCategories = async () => {
  const [resultSets] = await pool.query('CALL SP_GetCategories()')
  const rows = Array.isArray(resultSets) && Array.isArray(resultSets[0]) ? resultSets[0] : resultSets
  return rows.map((r) => r.kategori)
}

export const addSukuCadang = async (event, payload) => {
  const { nama, kategori, kuantitas_fisik, batas_minimum } = payload
  try {
    await pool.query('CALL SP_AddSukuCadang(?,?,?,?)', [
      nama, 
      kategori, 
      kuantitas_fisik || 0, 
      batas_minimum || 0
    ])
    return { success: true }
  } catch (err) {
    throw new Error(err.sqlMessage || err.message || 'DB insert error')
  }
}

export const addKendaraan = async (event, payload) => {
  const { nomor_polisi, tahun, odometer, status } = payload
  try {
    await pool.query('CALL SP_AddKendaraan(?,?,?,?)', [
      nomor_polisi, 
      tahun || null, 
      odometer || 0, 
      status || 'Aktif'
    ])
    return { success: true }
  } catch (err) {
    throw new Error(err.sqlMessage || err.message || 'DB insert error')
  }
}

export const updateKendaraanStatus = async (event, payload) => {
  const { nomor_polisi, status } = payload
  try {
    await pool.query('CALL SP_UpdateKendaraanStatus(?,?)', [nomor_polisi, status])
    return { success: true }
  } catch (err) {
    throw new Error(err.sqlMessage || err.message || 'DB update error')
  }
}

export const getMechanics = async () => {
  const [resultSets] = await pool.query('CALL SP_GetMechanics()')
  return Array.isArray(resultSets) && Array.isArray(resultSets[0]) ? resultSets[0] : resultSets
}

export const getKendaraanForMekanik = async (event, id_user) => {
  const [resultSets] = await pool.query('CALL SP_GetKendaraanForMekanik(?)', [id_user])
  return Array.isArray(resultSets) && Array.isArray(resultSets[0]) ? resultSets[0] : resultSets
}

export const getAssignedRepairByVehicle = async (event, payload) => {
  const { nomor_polisi, id_user } = payload
  const [resultSets] = await pool.query('CALL SP_GetAssignedRepairByVehicle(?,?)', [nomor_polisi, id_user])
  const rows = Array.isArray(resultSets) && Array.isArray(resultSets[0]) ? resultSets[0] : resultSets
  return rows && rows.length > 0 ? rows[0] : null
}

export const assignRepair = async (event, payload) => {
  const { nomor_polisi, id_mekanik, id_assigned_by, catatan_kerusakan } = payload 
  try {
    await pool.query('CALL SP_AssignRepairToMekanik(?,?,?,?)', [
      nomor_polisi, 
      id_mekanik, 
      id_assigned_by, 
      catatan_kerusakan
    ])
    return { success: true }
  } catch (err) {
    throw new Error(err.sqlMessage || err.message || 'DB assign error')
  }
}

export const addLogPerbaikan = async (event, payload) => {
  const { nomor_polisi, id_mekanik } = payload
  try {
    await pool.query('CALL SP_AddLogPerbaikan(?,?)', [
      nomor_polisi, 
      id_mekanik || null
    ])
    return { success: true }
  } catch (err) {
    throw new Error(err.sqlMessage || err.message || 'DB insert error')
  }
}

export const deleteKendaraan = async (event, nomor_polisi) => {
  try {
    await pool.query('CALL SP_DeleteKendaraan(?)', [nomor_polisi])
    return { success: true }
  } catch (err) {
    if (err && err.code === 'ER_ROW_IS_REFERENCED_2') {
      throw new Error(
        'Kendaraan memiliki referensi log perbaikan; hapus atau batalkan log terlebih dahulu'
      )
    }
    throw new Error(err.sqlMessage || err.message || 'DB delete error')
  }
}

export const getSukuByKategori = async (event, kategori) => {
  const [resultSets] = await pool.query('CALL SP_GetSukuByKategori(?)', [kategori])
  return Array.isArray(resultSets) && Array.isArray(resultSets[0]) ? resultSets[0] : resultSets
}

export const getReports = async () => {
  const reports = {}
  const [resultSets] = await pool.query('CALL SP_GetReports()')
  reports.kesiapan_armada = resultSets[0] || []
  reports.kesiapan_kendaraan = reports.kesiapan_armada
  reports.defisit_inventaris = resultSets[1] || []
  reports.frekuensi_kerusakan = resultSets[2] || []
  reports.distribusi_penugasan = resultSets[3] || []
  reports.konsumsi_komponen = resultSets[4] || []
  return reports
}

export const login = async (event, username, password) => {
  try {
    const [resultSets] = await pool.query('CALL SP_LoginUser(?,?)', [username, password])
    const rows = Array.isArray(resultSets) && Array.isArray(resultSets[0]) ? resultSets[0] : resultSets
    if (!rows || rows.length === 0) {
      throw new Error('Invalid username or password')
    }
    return rows[0]
  } catch (err) {
    throw new Error(err.sqlMessage || err.message || 'Login error')
  }
}

export const addMechanic = async (event, payload) => {
  const data = payload || {}
  const usernameFix = data.username || data.user
  const passwordFix = data.password || data.pass
  const namaFix = data.nama || usernameFix

  try {
    // 💡 CATATAN: Pastikan Anda sudah membuat SP_AddMechanic di database 
    // untuk melakukan INSERT ke tabel `users` dengan default `id_role` milik Mekanik.
    await pool.query('CALL SP_AddMechanic(?,?,?)', [
      namaFix,
      usernameFix,
      passwordFix
    ])
    return { success: true }
  } catch (err) {
    throw new Error(err.sqlMessage || err.message || 'DB insert mechanic error')
  }
}