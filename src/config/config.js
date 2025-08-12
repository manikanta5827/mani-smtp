require('dotenv').config();

const config = {
  // Server Configuration
  nodeEnv: process.env.NODE_ENV || 'development',
  smtpPort: parseInt(process.env.SMTP_PORT) || 2525,
  port: parseInt(process.env.PORT) || 3000,
  
  // CORS Settings
  allowedOrigin: process.env.ALLOWED_ORIGIN || '*',
  
  // Temp Mail Service Settings
  tempMailDomain: process.env.TEMP_MAIL_DOMAIN || 'chilaka.online',
};

module.exports = config;
