// index.js
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import crypto from 'crypto'
import dotenv from 'dotenv'
import { create } from 'ipfs-http-client'
import fs from 'fs'
import pg from 'pg'
import pool from './db.mjs'


const { Pool } = pg
dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get('/certificados', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM certificados ORDER BY fecha DESC')
    res.json(result.rows)
  } catch (err) {
    console.error('❌ Error al obtener certificados:', err)
    res.status(500).json({ error: 'Error al obtener certificados' })
  }
})

app.delete('/eliminar-certificado/:id', async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query('DELETE FROM certificados WHERE id = $1', [id])
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Certificado no encontrado' })
    }
    res.json({ message: 'Certificado eliminado correctamente' })
  } catch (err) {
    console.error('❌ Error al eliminar certificado:', err)
    res.status(500).json({ error: 'Error al eliminar certificado' })
  }
})


// Configurar IPFS client (usando cluster)
const ipfs = create({ url: 'http://192.168.1.16:9095/api/v0' })


// Configurar Multer para subir PDFs temporalmente
const upload = multer({ dest: 'uploads/' })


// Ruta para guardar rol
app.post('/guardar-rol', express.json(), async (req, res) => {
  const { wallet, role } = req.body

  if (!wallet || !role) {
    return res.status(400).json({ error: 'Faltan datos' })
  }

  try {
    await pool.query(
      'INSERT INTO wallet_roles (wallet, role) VALUES ($1, $2) ON CONFLICT (wallet) DO UPDATE SET role = EXCLUDED.role',
      [wallet, role]
    )

    return res.json({ message: 'Rol guardado correctamente' }) // ✅ OBLIGATORIO
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error al guardar el rol' })
  }
})

app.delete('/eliminar-rol/:wallet', async (req, res) => {
  const { wallet } = req.params

  try {
    const result = await pool.query('DELETE FROM wallet_roles WHERE wallet = $1', [wallet])
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Wallet no encontrada' })
    }
    res.json({ message: 'Rol eliminado correctamente' })
  } catch (err) {
    console.error('❌ Error en /eliminar-rol:', err)
    res.status(500).json({ error: 'Error al eliminar el rol' })
  }
})

app.get('/roles/:wallet', async (req, res) => {
  const { wallet } = req.params

  try {
    const result = await pool.query('SELECT role FROM wallet_roles WHERE wallet = $1', [wallet])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No se encontró un rol para esta wallet' })
    }
    res.json({ role: result.rows[0].role })
  } catch (err) {
    console.error('❌ Error en /roles/:wallet:', err)
    res.status(500).json({ error: 'Error interno' })
  }
})


// Ruta para subir certificado PDF
app.post('/subir-certificado', upload.single('file'), async (req, res) => {
  const file = req.file
  const wallet = req.body.wallet

  if (!file || !wallet) {
    return res.status(400).json({ error: 'Archivo PDF y wallet requeridos' })
  }

  const buffer = fs.readFileSync(file.path)
  const hash = crypto.createHash('sha256').update(buffer).digest('hex')

  try {
    // Verificar si ya existe
    const result = await pool.query('SELECT * FROM certificados WHERE hash = $1', [hash])
    if (result.rows.length > 0) {
      fs.unlinkSync(file.path) // Eliminar el archivo temporal
      return res.status(409).json({ error: 'Ya existe un certificado con este hash' })
    }

    // Subir a IPFS
    const added = await ipfs.add(buffer)
    const cid = added.cid.toString()

    // Guardar en BD
    await pool.query(
      'INSERT INTO certificados (wallet, nombre_archivo, hash, cid) VALUES ($1, $2, $3, $4)',
      [wallet, file.originalname, hash, cid]
    )

    fs.unlinkSync(file.path)
    res.json({ message: 'Certificado subido', cid, hash })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al subir el certificado' })
  }
})

app.get('/listar-roles', async (req, res) => {
  try {
    const result = await pool.query('SELECT wallet, role FROM wallet_roles')

    // Transforma a formato que espera el frontend: { wallet1: role1, wallet2: role2 }
    const roles = {}
    result.rows.forEach(({ wallet, role }) => {
      roles[wallet] = role
    })

    res.json(roles)
  } catch (err) {
    console.error('❌ Error en /listar-roles:', err)
    res.status(500).json({ error: 'Error al cargar los roles' })
  }
})



app.post('/guardar-titulo', upload.single('file'), async (req, res) => {
  const { wallet, hash } = req.body
  const file = req.file

  if (!file || !wallet || !hash) {
    return res.status(400).json({ error: 'Faltan datos requeridos' })
  }

  try {
    // Verificar si ya existe el hash
    const existe = await pool.query('SELECT * FROM certificados WHERE hash = $1', [hash])
    if (existe.rows.length > 0) {
      fs.unlinkSync(file.path)
      return res.status(409).json({ error: 'Hash ya registrado' })
    }

    // Subir a IPFS
    const buffer = fs.readFileSync(file.path)
    const result = await ipfs.add(buffer)
    const cid = result.cid.toString()

    // Guardar en la base
    await pool.query(
      'INSERT INTO certificados (wallet, nombre_archivo, hash, cid) VALUES ($1, $2, $3, $4)',
      [wallet, file.originalname, hash, cid]
    )

    fs.unlinkSync(file.path)
    res.json({ message: 'Título guardado exitosamente', cid })
  } catch (err) {
    console.error('Error al guardar título:', err)
    res.status(500).json({ error: 'Error interno al guardar título' })
  }
})




app.listen(PORT, () => {
  console.log(`✅ Servidor backend corriendo en http://localhost:${PORT}`)
})



