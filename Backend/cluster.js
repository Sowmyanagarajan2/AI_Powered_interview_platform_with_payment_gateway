const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  const numCPUs = process.env.WEB_CONCURRENCY || os.cpus().length;
  console.log(`Master ${process.pid} is running — forking ${numCPUs} workers`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.warn(`Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}). Restarting...`);
    cluster.fork();
  });
} else {
  // Workers share the same server port
  require('./server');
}
