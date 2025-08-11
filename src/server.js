const config = require('./config/config');
const app = require('./app');
const SMTPServerService = require('./services/smtpServer');
const TempMailService = require('./services/temp-mail-service');

// Initialize services
const tempMailService = new TempMailService();
const smtpServer = new SMTPServerService(tempMailService);

// Start SMTP server
smtpServer.start();

// Start Express server
const server = app.listen(config.httpPort, "0.0.0.0", () => {
  console.log(`HTTP server running on port ${config.httpPort}`);
  console.log(`Web interface: http://localhost:${config.httpPort}`);
  console.log(`API endpoints: http://localhost:${config.httpPort}/api`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\nReceived ${signal}, shutting down gracefully...`);
  
  server.close(() => {
    console.log('HTTP server closed');
  });
  
  smtpServer.stop();
  
  setTimeout(() => {
    console.log('Process terminated');
    process.exit(0);
  }, 1000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
