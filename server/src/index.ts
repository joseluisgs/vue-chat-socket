import * as http from 'http';
import chalk from 'chalk';
import cluster from 'cluster';
import io from './io';

const { setupMaster } = require('@socket.io/sticky');

// Constantes del servidor
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;
const WORKERS_COUNT = process.env.WORKERS_COUNT || 4;

if (cluster.isMaster) {
  console.log(chalk.green.bold(`Master ${process.pid} Ejecutándose ✅`));

  // Un fork de los cluster
  for (let i = 0; i < WORKERS_COUNT; i += 1) {
    cluster.fork();
  }
  // Si recibimos que han salido o cerrado
  cluster.on('exit', (worker) => {
    console.log(chalk.yellow.bold(`Worker ${worker.process.pid} Termino`));
    cluster.fork();
  });

  // Creamos el servidor
  const httpServer = http.createServer();
  setupMaster(httpServer, {
    loadBalancingMethod: 'least-connection', // either "random", "round-robin" or "least-connection"
  });
  // Ejecutamos el servidor
  httpServer.listen(PORT, () => {
    console.log(chalk.green.bold(`🟢 Servidor CHAT escuchando ✅ -> http://${HOST}:${PORT}`));
  });
} else {
  console.log(chalk.blue.bold(`Worker ${process.pid} Iniciado`));
  // Asignamos el socket y su funcionalidad
  io();
}
