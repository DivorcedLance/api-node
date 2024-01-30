const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware para parsear el cuerpo de las solicitudes como JSON
app.use(bodyParser.json());

// Ruta POST en / para recibir texto
app.post('/', (req, res) => {
  console.log('-------------------');
  const textoRecibido = req.body.texto;
  console.log('Texto recibido:', textoRecibido);
  const distancia = req.body.distancia;
  console.log('Distancia:', distancia);
  const angulo = req.body.angulo;
  console.log('Angulo:', angulo);
  console.log('-------------------');
  res.send('Datos recibidos');
});

// Ruta GET en / para devolver una página web simple
app.get('/', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Página Web Simple</title>
    </head>
    <body>
      <h1>Página Web Simple</h1>
      <p>Bienvenido a mi servidor Express.</p>
    </body>
    </html>
  `;
  res.send(html);
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor Express en ejecución en http://localhost:${PORT}`);
});
