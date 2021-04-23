import * as http from 'http';
import chalk from 'chalk';
import io from './io';

// Constantes del servidor
const HOST = 'localhost';
const PORT = process.env.PORT || 3000;

// Creamos el servidor
const httpServer = http.createServer();
// Le asignamos el socket y su funcionalidad
io(httpServer);

httpServer.listen(PORT, () => {
  console.log(chalk.green.bold(`🟢 Servidor CHAT escuchando ✅ -> http://${HOST}:${PORT}`));
});
