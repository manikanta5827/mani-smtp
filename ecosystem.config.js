module.exports = {
  apps: [{
    name: 'smtp-server',
    script: 'src/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      SMTP_PORT: 2525,
      HTTP_PORT: 3001,
      SMTP_PASSWORD: process.env.SMTP_PASSWORD,
      ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN,
      TEMP_MAIL_DOMAIN: process.env.TEMP_MAIL_DOMAIN
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
