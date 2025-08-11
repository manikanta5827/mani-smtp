require('dotenv').config();

const config = {
  // Server Configuration
  nodeEnv: process.env.NODE_ENV || 'development',
  smtpPort: parseInt(process.env.SMTP_PORT) || 2525,
  httpPort: parseInt(process.env.HTTP_PORT) || 3001,
  
  // Production Configuration
  productionMode: process.env.NODE_ENV === 'production',
  
  // Security Settings
  smtpPassword: process.env.SMTP_PASSWORD || 'your-secure-password',
  allowedOrigin: process.env.ALLOWED_ORIGIN || '*',
  
  // Temp Mail Service Settings
  tempMailDomain: process.env.TEMP_MAIL_DOMAIN || 'tempmail.local',
  
  // File Paths
  emailLogFile: 'emails.txt',
  tempEmailsFile: 'temp-emails.json',
};

module.exports = config;
