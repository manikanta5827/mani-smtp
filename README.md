# Temp Mail Service

A temporary email service that allows users to generate disposable email addresses and receive emails for a short period. Perfect for testing, avoiding spam, or temporary registrations.

## Features

- Generate random temporary email addresses
- Receive emails from any domain
- RESTful API for email management
- Express.js web framework with clean architecture
- PM2 process management for production
- Modern web interface with real-time updates

## Project Structure

```
smtp-server/
├── src/
│   ├── config/
│   │   └── config.js          # Configuration management
│   ├── controllers/
│   │   └── emailController.js # Email API controllers
│   ├── middleware/
│   │   └── rateLimiter.js     # Rate limiting middleware
│   ├── routes/
│   │   └── emailRoutes.js     # API routes
│   ├── services/
│   │   ├── smtpServer.js      # SMTP server service
│   │   └── temp-mail-service.js # Temp mail service
│   ├── utils/
│   │   └── logger.js          # Logging utility
│   ├── app.js                 # Express application
│   └── server.js              # Main server entry point
├── public/
│   ├── css/
│   │   └── style.css          # Frontend styles
│   ├── js/
│   │   └── app.js             # Frontend JavaScript
│   └── index.html             # Web interface
├── .github/workflows/
│   └── deploy.yml             # CI/CD deployment
├── ecosystem.config.js        # PM2 configuration
├── package.json               # Dependencies and scripts
└── env.example                # Environment variables template
```

## Production Deployment on AWS EC2

### Prerequisites

1. **EC2 Instance Setup**
   - Ubuntu 20.04+ recommended
   - At least 1GB RAM
   - Security groups configured for ports 2525 (SMTP) and 3001 (HTTP)

2. **Required Software**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 globally
   sudo npm install -g pm2
   
   # Install nginx (optional, for reverse proxy)
   sudo apt install nginx
   ```

### Security Group Configuration

Configure your EC2 security group to allow:
- **Port 2525** (SMTP) - TCP from anywhere (for receiving emails)
- **Port 3001** (HTTP) - TCP from anywhere (for API access)
- **Port 22** (SSH) - TCP from your IP

### Deployment Steps

1. **Clone and Setup**
   ```bash
   git clone <your-repo>
   cd smtp-server
   ```

2. **Configure Environment**
   ```bash
   cp env.example .env
   nano .env
   ```
   
   Update the `.env` file with your production values:
   ```env
   NODE_ENV=production
   SMTP_PORT=2525
   HTTP_PORT=3001
   SMTP_PASSWORD=your-very-secure-password
   MAX_EMAILS_PER_MINUTE=100
   ALLOWED_ORIGIN=https://yourdomain.com
   TEMP_MAIL_DOMAIN=tempmail.yourdomain.com
   EMAIL_EXPIRY_HOURS=24
   CLEANUP_INTERVAL=3600000
   ```

3. **Deploy**
   
   **Option A: Automated Deployment (Recommended)**
   ```bash
   # Push to main branch - GitHub Actions will deploy automatically
   git push origin main
   ```
   
   **Option B: Manual Deployment**
   ```bash
   # SSH into your EC2 instance and run:
   cd /home/ubuntu/smtp-server
   git pull origin main
   npm install --production
   mkdir -p logs
   pm2 restart ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production
   pm2 save
   ```

### Production Security Considerations

1. **Authentication**: The server requires SMTP authentication in production mode
2. **Firewall**: Use AWS security groups to restrict access
3. **SSL/TLS**: Consider adding SSL/TLS support for encrypted email transmission

### Monitoring and Maintenance

```bash
# View logs
pm2 logs smtp-server

# Monitor processes
pm2 monit

# Restart server
pm2 restart smtp-server

# Stop server
pm2 stop smtp-server

# View status
pm2 status
```

### Web Interface

Access the web interface at `http://your-server:3001/` for a user-friendly way to:
- Generate temporary email addresses
- View received emails in real-time
- Delete individual emails or all emails for an address
- View service statistics

### API Endpoints

- **Web Interface**: `GET /` - Main HTML interface
- **Generate Email**: `GET /api/generate-email`
- **Get Emails**: `GET /api/emails?address=user@tempmail.local`
- **Delete Email**: `DELETE /api/email?id=email_id&address=user@tempmail.local`
- **Delete All Emails**: `DELETE /api/emails?address=user@tempmail.local`
- **Service Stats**: `GET /api/stats`
- **Legacy Log**: `GET /emails` (old format)

### Example Usage

```bash
# Generate a new temp email
curl http://your-server:3001/api/generate-email
# Response: {"email": "abc123@tempmail.local"}

# Check for emails
curl http://your-server:3001/api/emails?address=abc123@tempmail.local
# Response: {"emails": [...]}

# Delete all emails for an address
curl -X DELETE http://your-server:3001/api/emails?address=abc123@tempmail.local
```

### Troubleshooting

1. **Check PM2 logs**: `pm2 logs smtp-server`
2. **Check system logs**: `sudo journalctl -u pm2-ubuntu`
3. **Verify ports**: `sudo netstat -tlnp | grep :2525`
4. **Test SMTP**: Use telnet or a mail client to test connectivity

### Development

```bash
# Development mode (no authentication)
npm run dev

# Production mode locally
npm run prod
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `SMTP_PORT` | SMTP server port | `2525` |
| `HTTP_PORT` | HTTP server port | `3001` |
| `SMTP_PASSWORD` | SMTP authentication password | Required in production |
| `ALLOWED_ORIGIN` | CORS allowed origin | `*` |
| `TEMP_MAIL_DOMAIN` | Domain for temp email addresses | `tempmail.local` |

## License

ISC
