const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const path = require('path');
const { createClient } = require('@libsql/client')

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

const db = createClient({
  url: 'libsql://unique-menace-divorcedlance.turso.io',
  authToken: process.env.DB_TOKEN,
});

(async () => {
  try {
    await db.execute(`
    CREATE TABLE IF NOT EXISTS reportes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      distancia FLOAT,
      angulo FLOAT,
      tiempo TEXT
    )
    `)

    // Otro código que pueda requerir await...
  } catch (error) {
    console.error('Error al ejecutar la consulta SQL:', error)
  }
})()

// Middleware para parsear el cuerpo de las solicitudes como JSON
app.use(bodyParser.json())

app.get('/', function(req, res) {
  res.sendFile(path.join('./static', '/index.html'));
});

// Ruta POST en / para recibir texto
app.post('/', async (req, res) => {
  const reportes = req.body.reportes

  reportes.forEach(async (reporte) => {
    let distancia = parseFloat(reporte.distancia)
    let angulo = parseFloat(reporte.angulo)
    let tiempo = convertirHoraStringADate(reporte.tiempo)

    // Insertar datos en la base de datos
    try {
      await storeData(distancia, angulo, tiempo)
    } catch (error) {
      console.error('Error al insertar en la base de datos:', error)
      res.status(500).send('Error al procesar la solicitud')
      return
    }

    console.log(
      tiempo.toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
      'Angulo:',
      angulo,
      'Tiempo:',
      'Distancia:',
      distancia
    )
  })

  // Enviar una respuesta simple
  res.send('Datos recibidos')
})

// Agrega una nueva ruta GET en / para obtener todos los valores de la tabla
app.get('/reportes', async (req, res) => {
  // res.setHeader('Access-Control-Allow-Origin', '*')
  try {
    const datos = await getAllReports()
    res.json(datos)
  } catch (error) {
    console.error('Error al obtener datos de la base de datos:', error);
    res.status(500).send('Error al procesar la solicitud');
  }
});

app.get('/reportes/:numero', async (req, res) => {
  // res.setHeader('Access-Control-Allow-Origin', '*')
  try {
    let numero = req.params.numero; // Obtén el parámetro de la ruta
    numero = parseInt(numero, 10);
    const datos = await getReports(numero);
    res.json(datos);
  } catch (error) {
    console.error('Error al obtener datos de la base de datos:', error);
    res.status(500).send('Error al procesar la solicitud');
  }
});

// Inicia el servidor
app.listen(port, () => {
  console.log(
    `Servidor Express en ejecución en http://node-api-ge59.onrender.com:${port}`
  )
})

function convertirHoraStringADate(horaString) {
  const [hora, minutos, segundos] = horaString.split(':').map(Number)

  const fechaActual = new Date()

  // Establecemos el día actual
  fechaActual.setMilliseconds(0) // Limpiamos los mili segundos para evitar posibles problemas
  fechaActual.setHours(0, 0, 0, 0) // Establecemos la hora a la medianoche

  // Establecemos la hora, minutos y segundos
  fechaActual.setHours(hora)
  fechaActual.setMinutes(minutos)
  fechaActual.setSeconds(segundos)

  return fechaActual
}

// Función mejorada para almacenar datos en la base de datos
async function storeData(distancia, angulo, tiempo) {
  try {
    await db.execute({
      sql: 'INSERT INTO reportes (distancia, angulo, tiempo) VALUES (?, ?, ?)',
      args: [
        distancia,
        angulo,
        tiempo.toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
      ],
    })
  } catch (error) {
    throw error
  }
}

async function getAllReports() {
  try {
    const response = await db.execute('SELECT * FROM reportes')
    return response.rows
  } catch (error) {
    throw error
  }
}

async function getReports(number) {
  try {
    const response = await db.execute({
      sql: 'SELECT * FROM reportes ORDER BY id DESC LIMIT ?',
      args: [number],
    })
    console.log(response.rows)
    return response.rows
  } catch (error) {
    throw error
  }
}