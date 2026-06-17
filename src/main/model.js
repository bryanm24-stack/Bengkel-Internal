const mysql = require('mysql2/promise')
import dotenv from 'dotenv'

dotenv.config()
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10
})
// New methods for maintenance system


export const getCategories = async () => {
  const [resultSets] = await pool.query('CALL SP_GetCategories()')
  const rows =
    Array.isArray(resultSets) && Array.isArray(resultSets[0]) ? resultSets[0] : resultSets
  return rows.map((r) => r.kategori)
}

export const addSukuCadang = async (event, payload) => {
  const { nama, kategori, kuantitas_fisik, batas_minimum } = payload
  try {
    const [res] = await pool.query(
      'INSERT INTO Suku_Cadang (nama,kategori,kuantitas_fisik,batas_minimum) VALUES (?,?,?,?)',
      [nama, kategori, kuantitas_fisik || 0, batas_minimum || 0]
    )
    return { success: true, insertId: res.insertId }
  } catch (err) {
    throw new Error(err.sqlMessage || err.message || 'DB insert error')
  }
}


export const getSukuByKategori = async (event, kategori) => {
  const [resultSets] = await pool.query('CALL SP_GetSukuByKategori(?)', [kategori])
  return Array.isArray(resultSets) && Array.isArray(resultSets[0]) ? resultSets[0] : resultSets
}



export const login = async (event, username, password) => {
  try {
    const [resultSets] = await pool.query('CALL SP_LoginUser(?,?)', [username, password])
    const rows =
      Array.isArray(resultSets) && Array.isArray(resultSets[0]) ? resultSets[0] : resultSets
    if (!rows || rows.length === 0) {
      throw new Error('Invalid username or password')
    }
    return rows[0]
  } catch (err) {
    throw new Error(err.sqlMessage || err.message || 'Login error')
  }
}
