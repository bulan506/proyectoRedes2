const next = require('next');
const http = require('http');
const httpsLocalhost = require('https-localhost');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  // Crear servidor HTTP
  const httpServer = http.createServer((req, res) => {
    handle(req, res);
  });

  // Crear servidor HTTPS
  const httpsServer = await httpsLocalhost();

  // Configurar manejo de rutas para HTTPS
  httpsServer.get('*', (req, res) => {
    return handle(req, res);
  });

  // Iniciar servidores
  httpServer.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });

  httpsServer.listen(3001, (err) => {
    if (err) throw err;
    console.log('> Ready on https://localhost:3001');
  });
});