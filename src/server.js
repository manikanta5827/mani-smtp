const app = require('./app');
const SMTPServerService = require('./services/smtp-server-service');
const config = require('./config/config');

// Create SMTP server instance
const smtpServer = new SMTPServerService();

// Start SMTP server
smtpServer.start();

// Start HTTP server
const PORT = config.port || 3000;
app.listen(PORT, () => {
  console.log(`🚀 HTTP server running on port ${PORT}`);
  console.log(`📧 SMTP server running on port ${config.smtpPort}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  smtpServer.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  smtpServer.stop();
  process.exit(0);
});
